import { Router, Request, Response } from 'express';
import { getChatService } from '../services/chatService';
import { ProxyChatRequest, CreateSessionRequest, GetConfigsRequest, FollowUpsRequest, Preprompt } from '../types/chat';
import { getAvailableCharacters, getAvailableCharacterIds } from '../config/characters';
import { stripCurlyBracketTags } from '../utils/textUtils';

const router = Router();

// GET /api/config/:configId - Fetch character config
router.get('/config/:configId', async (req: Request, res: Response) => {
  try {
    const { configId } = req.params;

    if (!configId) {
      return res.status(400).json({ error: 'Config ID is required' });
    }

    const chatService = getChatService();
    const config = await chatService.getConfig(configId);

    res.json(config);
  } catch (error: any) {
    console.error('Error fetching config:', error);
    
    // Check if the error is a 404 from the upstream API
    const isNotFound = error.message && (
      error.message.includes('404') || 
      error.message.includes('not found') ||
      error.message.includes('Not Found')
    );
    
    if (isNotFound) {
      console.warn(`[GET /api/config/${req.params.configId}] Character config not found on upstream API. This character may have been removed or the ID may be incorrect.`);
      return res.status(404).json({
        error: 'Config not found',
        message: `Character config ${req.params.configId} not found on upstream API`,
        configId: req.params.configId
      });
    }
    
    // For other errors, return 500
    res.status(500).json({
      error: 'Failed to fetch config',
      message: error.message
    });
  }
});

// GET /api/characters - Get all available characters with their configs
router.get('/characters', async (req: Request, res: Response) => {
  try {
    // Get character definitions - this is the source of truth for character IDs
    const characterDefinitions = getAvailableCharacters();
    
    // Use definitions directly to ensure stable order and IDs
    // Don't rely on getAvailableCharacterIds() which might have different ordering
    if (characterDefinitions.length === 0) {
      return res.json({
        characters: [],
        total: 0
      });
    }

    // Extract character IDs from definitions in order
    const characterIds = characterDefinitions.map(def => def.config_id);

    const chatService = getChatService();
    
    // Try to fetch configs, but don't fail if they're unavailable
    let charactersWithConfigs: Array<{ config_id: string; config: any }> = [];
    try {
      charactersWithConfigs = await chatService.getAvailableCharactersWithConfigs(characterIds);
    } catch (error) {
      console.error('Warning: Failed to fetch some character configs:', error);
      // Continue anyway - we'll return characters without configs
    }

    // Build a map of config_id -> config for quick lookup
    const configMap = new Map(
      charactersWithConfigs.map(({ config_id, config }) => [config_id, config])
    );

    // Merge with metadata from character definitions
    // Return all defined characters, even if config fetch failed
    // IMPORTANT: Always use the config_id from our definitions, never from the upstream config
    // This ensures character IDs remain stable across deployments and refreshes
    const characters = characterDefinitions.map((definition) => {
      const config_id = definition.config_id; // Always use the ID from our definition
      const config = configMap.get(config_id) || null;
      
      // Ensure config_id is always from our definition, never from upstream config
      // This prevents character IDs from changing between deployments/refreshes
      // Prioritize definition's avatar_url, but fall back to API config's avatar_url if definition doesn't have one
      const avatar_url = definition.avatar_url || config?.avatar_url || null;
      
      // Log avatar_url processing for debugging
      if (avatar_url) {
        console.log(`[characters] Character ${definition.name || config_id}: avatar_url=${avatar_url} (from ${definition.avatar_url ? 'definition' : 'API config'})`);
      } else if (config?.avatar_url) {
        console.log(`[characters] Character ${definition.name || config_id}: API config has avatar_url=${config.avatar_url} but it's not being used`);
      }
      
      const character = {
        config_id, // Always use the hardcoded config_id from our definitions
        name: definition.name || config?.name || null,
        description: definition.description || config?.description || null,
        display_order: definition.display_order,
        avatar_url, // Use definition's avatar_url first, fall back to API config's
        config: config ? {
          ...config,
          // Override any config_id in the nested config to match our definition
          config_id: config_id
        } : null, // Full character config from API (may be null if fetch failed)
      };
      
      return character;
    }).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    res.json({
      characters,
      total: characters.length
    });
  } catch (error: any) {
    console.error('Error fetching available characters:', error);
    res.status(500).json({
      error: 'Failed to fetch available characters',
      message: error.message
    });
  }
});

// POST /api/configs - Get multiple character configs (for specific IDs)
router.post('/configs', async (req: Request, res: Response) => {
  try {
    const { config_ids } = req.body as GetConfigsRequest;

    if (!config_ids || !Array.isArray(config_ids) || config_ids.length === 0) {
      return res.status(400).json({ error: 'config_ids array is required' });
    }

    // Limit to prevent abuse
    if (config_ids.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 config IDs allowed per request' });
    }

    const chatService = getChatService();
    const configs = await chatService.getConfigs(config_ids);

    res.json({
      configs,
      requested: config_ids.length,
      retrieved: Object.keys(configs).length
    });
  } catch (error: any) {
    console.error('Error fetching configs:', error);
    res.status(500).json({
      error: 'Failed to fetch configs',
      message: error.message
    });
  }
});

// POST /api/sessions - Create new chat session
router.post('/sessions', async (req: Request, res: Response) => {
  try {
    const { config_id } = req.body as CreateSessionRequest;

    if (!config_id) {
      return res.status(400).json({ error: 'config_id is required' });
    }

    const chatService = getChatService();
    const session = await chatService.createSession({ config_id });

    // Automatically send greeting message to initialize the conversation
    const greetingMessage = "I just walked in on you, greet me and tell me your current scenario";
    let greetingResponse: any = null;
    
    try {
      const chatResponse = await chatService.sendChat({
        session_id: session.session_id,
        input: greetingMessage,
        config_id,
      });

      // Strip curly bracket tags from greeting response
      const cleanedAi = stripCurlyBracketTags(chatResponse.ai);
      const cleanedTextResponse = stripCurlyBracketTags(chatResponse.text_response_cleaned);

      // Generate preprompts for the greeting response
      let preprompts: Preprompt[] | undefined;
      try {
        if (greetingMessage && (chatResponse.ai || chatResponse.text_response_cleaned)) {
          preprompts = await chatService.generatePreprompts(
            greetingMessage,
            chatResponse.text_response_cleaned || chatResponse.ai || ''
          );
        }
      } catch (error) {
        console.error('Warning: Failed to generate preprompts for greeting response:', error);
      }

      greetingResponse = {
        ai: cleanedAi,
        text_response_cleaned: cleanedTextResponse,
        request_id: chatResponse.request_id,
        warning_message: chatResponse.warning_message,
        preprompts,
      };
    } catch (error) {
      console.error('Warning: Failed to send greeting message:', error);
      // Continue even if greeting fails - return session without greeting
    }

    // Return session with initial greeting response
    res.json({
      ...session,
      initial_message: greetingResponse,
    });
  } catch (error: any) {
    console.error('Error creating session:', error);
    res.status(500).json({
      error: 'Failed to create session',
      message: error.message
    });
  }
});

// POST /api/chat - Send chat message
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { session_id, input, config_id } = req.body as ProxyChatRequest;

    // session_id can be empty string (API will create new session)
    if (session_id === undefined || !input || !config_id) {
      return res.status(400).json({
        error: 'session_id (can be empty), input, and config_id are required'
      });
    }

    const chatService = getChatService();
    const response = await chatService.sendChat({
      session_id,
      input,
      config_id,
    });

    let preprompts: Preprompt[] | undefined;
    try {
      if (input && (response.ai || response.text_response_cleaned)) {
        preprompts = await chatService.generatePreprompts(
          input,
          response.text_response_cleaned || response.ai || ''
        );
      }
    } catch (error) {
      console.error('Warning: Failed to generate preprompts for chat response:', error);
    }

    // Strip curly bracket tags from response text before returning to frontend
    const cleanedAi = stripCurlyBracketTags(response.ai);
    const cleanedTextResponse = stripCurlyBracketTags(response.text_response_cleaned);

    // Return simplified response to frontend
    res.json({
      ai: cleanedAi,
      session_id: response.session.id,
      request_id: response.request_id,
      text_response_cleaned: cleanedTextResponse,
      warning_message: response.warning_message,
      preprompts,
    });
  } catch (error: any) {
    console.error('Error sending chat:', error);
    res.status(500).json({
      error: 'Failed to send chat message',
      message: error.message
    });
  }
});

// POST /api/initial-message - Get initial greeting message for a chat session
// This endpoint should be called when entering a chat room to trigger the character's first message
router.post('/initial-message', async (req: Request, res: Response) => {
  try {
    const { 
      session_id, 
      config_id, 
      previous_messages 
    } = req.body as { 
      session_id: string; 
      config_id: string; 
      previous_messages?: Array<{ role: 'user' | 'ai'; content: string }> 
    };

    if (!session_id || !config_id) {
      return res.status(400).json({
        error: 'session_id and config_id are required'
      });
    }

    const chatService = getChatService();
    
    // Determine which greeting message to use based on whether there are previous messages
    let greetingMessage: string;
    
    if (previous_messages && previous_messages.length > 0) {
      // User is returning to an existing chat - format previous messages
      const formattedMessages = previous_messages
        .map((msg, index) => {
          const speaker = msg.role === 'user' ? 'User' : 'You (the character)';
          return `${speaker}: ${msg.content}`;
        })
        .join('\n');
      
      greetingMessage = `[The user has returned, greet the user again understanding that they've come back, these are the previous messages between you: ${formattedMessages}]`;
    } else {
      // New chat - use the original greeting
      greetingMessage = "I just walked in on you, greet me and tell me your current scenario";
    }
    
    const chatResponse = await chatService.sendChat({
      session_id,
      input: greetingMessage,
      config_id,
    });

    // Strip curly bracket tags from greeting response
    const cleanedAi = stripCurlyBracketTags(chatResponse.ai);
    const cleanedTextResponse = stripCurlyBracketTags(chatResponse.text_response_cleaned);

    // Generate preprompts for the greeting response
    let preprompts: Preprompt[] | undefined;
    try {
      if (greetingMessage && (chatResponse.ai || chatResponse.text_response_cleaned)) {
        preprompts = await chatService.generatePreprompts(
          greetingMessage,
          chatResponse.text_response_cleaned || chatResponse.ai || ''
        );
      }
    } catch (error) {
      console.error('Warning: Failed to generate preprompts for initial message:', error);
    }

    // Return the initial message response (same format as regular chat response)
    res.json({
      ai: cleanedAi,
      session_id: chatResponse.session.id,
      request_id: chatResponse.request_id,
      text_response_cleaned: cleanedTextResponse,
      warning_message: chatResponse.warning_message,
      preprompts,
    });
  } catch (error: any) {
    console.error('Error getting initial message:', error);
    res.status(500).json({
      error: 'Failed to get initial message',
      message: error.message
    });
  }
});

// POST /api/followups - Generate contextual follow-up options
router.post('/followups', async (req: Request, res: Response) => {
  try {
    const { user_turn, assistant_turn } = req.body as FollowUpsRequest;

    if (!user_turn || !assistant_turn) {
      return res.status(400).json({
        error: 'user_turn and assistant_turn are required'
      });
    }

    const chatService = getChatService();
    const preprompts = await chatService.getFollowUps(user_turn, assistant_turn);

    res.json({
      preprompts,
    });
  } catch (error: any) {
    console.error('Error generating follow-ups:', error);
    res.status(500).json({
      error: 'Failed to generate follow-ups',
      message: error.message
    });
  }
});

export default router;
