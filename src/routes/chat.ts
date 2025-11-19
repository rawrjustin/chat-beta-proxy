import { Router, Request, Response } from 'express';
import { getChatService } from '../services/chatService';
import { ProxyChatRequest, CreateSessionRequest, GetConfigsRequest, FollowUpsRequest, Preprompt, ConversationMessage } from '../types/chat';
import { getAvailableCharacters, getAvailableCharacterIds, getCharacterById, characterExists } from '../config/characters';
import { stripCurlyBracketTags } from '../utils/textUtils';
import { getPasswordService } from '../services/passwordService';

const router = Router();

/**
 * Helper function to validate password access for a character
 * Returns null if access is granted, or an error response object if access is denied
 */
function validatePasswordAccess(
  configId: string,
  characterAccessToken?: string,
  characterPassword?: string
): { status: number; error: string; password_required?: boolean } | null {
  const passwordService = getPasswordService();
  
  // If character doesn't require a password, allow access
  if (!passwordService.hasPassword(configId)) {
    return null;
  }
  
  // Character requires password - check if token or password is provided
  if (characterAccessToken) {
    // Validate token
    if (passwordService.validateToken(characterAccessToken, configId)) {
      return null; // Token is valid
    }
    // Token is invalid or expired
    console.log(`[validatePasswordAccess] Invalid/expired token for ${configId}`);
    return {
      status: 401,
      error: 'Invalid or expired access token',
      password_required: true,
    };
  }
  
  if (characterPassword) {
    // Validate password
    if (passwordService.verifyPassword(configId, characterPassword)) {
      return null; // Password is correct
    }
    // Password is incorrect
    console.log(`[validatePasswordAccess] Invalid password for ${configId}`);
    return {
      status: 401,
      error: 'Invalid password',
      password_required: true,
    };
  }
  
  // No token or password provided
  console.log(`[validatePasswordAccess] Password required for ${configId} but no token/password provided`);
  return {
    status: 401,
    error: 'Password required',
    password_required: true,
  };
}

// GET /api/character/:configId - Get character metadata (including hidden characters)
// This endpoint allows frontend to validate character IDs from URL parameters
router.get('/character/:configId', async (req: Request, res: Response) => {
  try {
    const { configId } = req.params;

    if (!configId) {
      return res.status(400).json({ error: 'Config ID is required' });
    }

    // Check if character exists in our config (including hidden ones)
    const character = getCharacterById(configId);
    
    if (!character) {
      return res.status(404).json({
        error: 'Character not found',
        message: `Character ${configId} is not in the available characters list`,
        configId
      });
    }

    // Try to fetch the full config from upstream API
    const chatService = getChatService();
    let config = null;
    try {
      config = await chatService.getConfig(configId);
    } catch (error) {
      console.warn(`[GET /api/character/${configId}] Failed to fetch config from upstream API, but character exists in config`);
    }

    // Get password metadata
    const passwordService = getPasswordService();
    const passwordMetadata = passwordService.getPasswordMetadata(configId);

    // Return character metadata (including hidden status and password metadata)
    res.json({
      config_id: character.config_id,
      name: character.name || null,
      description: character.description || null,
      display_order: character.display_order || null,
      avatar_url: character.avatar_url || null,
      hidden: character.hidden || false,
      exists: true,
      config: config, // Full config from upstream API (may be null if fetch failed)
      ...passwordMetadata, // Include password_required, password_hint, password_updated_at
    });
  } catch (error: any) {
    console.error('Error fetching character:', error);
    res.status(500).json({
      error: 'Failed to fetch character',
      message: error.message
    });
  }
});

// GET /api/config/:configId - Fetch character config
// Returns the upstream config merged with local metadata (name, description, avatar_url)
// This ensures hidden characters have proper names/descriptions when accessed via direct URL
router.get('/config/:configId', async (req: Request, res: Response) => {
  try {
    const { configId } = req.params;

    if (!configId) {
      return res.status(400).json({ error: 'Config ID is required' });
    }

    // Check if character exists (including hidden ones) - this allows hidden characters to work
    const characterDefinition = getCharacterById(configId);
    if (!characterDefinition) {
      return res.status(404).json({
        error: 'Character not found',
        message: `Character ${configId} is not in the available characters list`,
        configId
      });
    }

    const chatService = getChatService();
    let upstreamConfig = null;
    
    try {
      upstreamConfig = await chatService.getConfig(configId);
    } catch (error: any) {
      // Check if the error is a 404 from the upstream API
      const isNotFound = error.message && (
        error.message.includes('404') || 
        error.message.includes('not found') ||
        error.message.includes('Not Found')
      );
      
      if (isNotFound) {
        console.warn(`[GET /api/config/${configId}] Character config not found on upstream API, but character exists in local config`);
        // Still return local metadata even if upstream config fails
        return res.json({
          config_id: characterDefinition.config_id,
          name: characterDefinition.name || null,
          description: characterDefinition.description || null,
          display_order: characterDefinition.display_order || null,
          avatar_url: characterDefinition.avatar_url || null,
          hidden: characterDefinition.hidden || false,
          // Upstream config is null, but we still have local metadata
          ...(upstreamConfig || {})
        });
      }
      
      // For other errors, rethrow
      throw error;
    }

    // Merge local metadata with upstream config
    // Prioritize local metadata (name, description, avatar_url) over upstream
    // Always use local metadata if it exists, even if it's an empty string
    const localName = characterDefinition.name !== undefined && characterDefinition.name !== null 
      ? characterDefinition.name 
      : (upstreamConfig?.name || null);
    const localDescription = characterDefinition.description !== undefined && characterDefinition.description !== null
      ? characterDefinition.description 
      : (upstreamConfig?.description || null);
    const localAvatarUrl = characterDefinition.avatar_url !== undefined && characterDefinition.avatar_url !== null
      ? characterDefinition.avatar_url 
      : (upstreamConfig?.avatar_url || null);
    
    // Log for debugging hidden characters
    if (characterDefinition.hidden) {
      console.log(`[GET /api/config/${configId}] Hidden character - local name: "${localName}", local description: "${localDescription}", upstream name: "${upstreamConfig?.name || 'null'}"`);
    }
    
    // Get password metadata
    const passwordService = getPasswordService();
    const passwordMetadata = passwordService.getPasswordMetadata(configId);
    
    const mergedConfig = {
      ...upstreamConfig,
      // CRITICAL: Override with local metadata - always prioritize local definitions
      // This ensures hidden characters show correct names/descriptions even if upstream has different values
      config_id: characterDefinition.config_id, // Always use local config_id
      name: localName,
      description: localDescription,
      display_order: characterDefinition.display_order !== undefined && characterDefinition.display_order !== null
        ? characterDefinition.display_order 
        : (upstreamConfig?.display_order || null),
      avatar_url: localAvatarUrl,
      hidden: characterDefinition.hidden !== undefined ? characterDefinition.hidden : false,
      ...passwordMetadata, // Include password_required, password_hint, password_updated_at
    };

    res.json(mergedConfig);
  } catch (error: any) {
    console.error('Error fetching config:', error);
    
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
    // This automatically filters out hidden characters
    const characterDefinitions = getAvailableCharacters();
    console.log(`[GET /api/characters] Returning ${characterDefinitions.length} visible characters (hidden characters filtered out)`);
    
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
      
      // Get password metadata
      const passwordService = getPasswordService();
      const passwordMetadata = passwordService.getPasswordMetadata(config_id);
      
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
        ...passwordMetadata, // Include password_required, password_hint, password_updated_at
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
    const { 
      config_id,
      character_access_token,
      character_password
    } = req.body as CreateSessionRequest & {
      character_access_token?: string;
      character_password?: string;
    };

    if (!config_id) {
      return res.status(400).json({ error: 'config_id is required' });
    }

    // Validate password access
    const accessError = validatePasswordAccess(config_id, character_access_token, character_password);
    if (accessError) {
      return res.status(accessError.status).json({
        error: accessError.error,
        password_required: accessError.password_required,
      });
    }

    const chatService = getChatService();
    const session = await chatService.createSession({ config_id });

    // Automatically send greeting message to initialize the conversation
    const greetingMessage = "I just walked in on you, greet me and conversationally tell me a little about what you're up to as if I was a friend";
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
            [
              { role: 'user', content: greetingMessage },
              { role: 'assistant', content: chatResponse.text_response_cleaned || chatResponse.ai || '' }
            ],
            config_id
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
    const { 
      session_id, 
      input, 
      config_id, 
      conversation_history,
      character_access_token,
      character_password
    } = req.body as ProxyChatRequest & {
      character_access_token?: string;
      character_password?: string;
    };

    // session_id can be empty string (API will create new session)
    if (session_id === undefined || !input || !config_id) {
      return res.status(400).json({
        error: 'session_id (can be empty), input, and config_id are required'
      });
    }

    // Validate password access
    const accessError = validatePasswordAccess(config_id, character_access_token, character_password);
    if (accessError) {
      return res.status(accessError.status).json({
        error: accessError.error,
        password_required: accessError.password_required,
      });
    }

    // Validate conversation_history if provided
    if (conversation_history) {
      if (!Array.isArray(conversation_history)) {
        return res.status(400).json({
          error: 'conversation_history must be an array'
        });
      }
      if (conversation_history.length > 8) {
        return res.status(400).json({
          error: 'conversation_history can contain at most 8 messages (4 pairs total)'
        });
      }
      for (let i = 0; i < conversation_history.length; i++) {
        const message = conversation_history[i];
        if (!message || typeof message !== 'object') {
          return res.status(400).json({
            error: `conversation_history[${i}] must be an object`
          });
        }
        if (message.role !== 'user' && message.role !== 'assistant') {
          return res.status(400).json({
            error: `conversation_history[${i}].role must be either 'user' or 'assistant'`,
            received: message.role,
            receivedType: typeof message.role,
            hint: message.role === 'ai' ? 'Use "assistant" instead of "ai"' : undefined
          });
        }
        if (typeof message.content !== 'string') {
          return res.status(400).json({
            error: `conversation_history[${i}].content must be a string`
          });
        }
      }
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
        // Use conversation_history if provided, otherwise fall back to just the current pair
        let historyForPreprompts: ConversationMessage[];
        
        if (conversation_history && conversation_history.length > 0) {
          // Add the current exchange to the conversation history
          historyForPreprompts = [
            ...conversation_history,
            { role: 'user' as const, content: input },
            { role: 'assistant' as const, content: response.text_response_cleaned || response.ai || '' }
          ].slice(-8) as ConversationMessage[]; // Keep only last 8 messages (4 pairs)
        } else {
          // Fall back to just the current pair
          historyForPreprompts = [
            { role: 'user' as const, content: input },
            { role: 'assistant' as const, content: response.text_response_cleaned || response.ai || '' }
          ];
        }
        
        preprompts = await chatService.generatePreprompts(
          historyForPreprompts,
          config_id
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
      previous_messages,
      conversation_history,
      character_access_token,
      character_password
    } = req.body as { 
      session_id: string; 
      config_id: string; 
      previous_messages?: Array<{ role: 'user' | 'ai'; content: string }>; // Legacy format
      conversation_history?: ConversationMessage[]; // New format
      character_access_token?: string;
      character_password?: string;
    };

    if (!session_id || !config_id) {
      return res.status(400).json({
        error: 'session_id and config_id are required'
      });
    }

    // Validate password access
    const accessError = validatePasswordAccess(config_id, character_access_token, character_password);
    if (accessError) {
      return res.status(accessError.status).json({
        error: accessError.error,
        password_required: accessError.password_required,
      });
    }

    // Validate conversation_history if provided
    if (conversation_history) {
      if (!Array.isArray(conversation_history)) {
        return res.status(400).json({
          error: 'conversation_history must be an array'
        });
      }
      if (conversation_history.length > 8) {
        return res.status(400).json({
          error: 'conversation_history can contain at most 8 messages (4 pairs total)'
        });
      }
      for (let i = 0; i < conversation_history.length; i++) {
        const message = conversation_history[i];
        if (!message || typeof message !== 'object') {
          return res.status(400).json({
            error: `conversation_history[${i}] must be an object`
          });
        }
        if (message.role !== 'user' && message.role !== 'assistant') {
          return res.status(400).json({
            error: `conversation_history[${i}].role must be either 'user' or 'assistant'`,
            received: message.role,
            receivedType: typeof message.role,
            hint: message.role === 'ai' ? 'Use "assistant" instead of "ai"' : undefined
          });
        }
        if (typeof message.content !== 'string') {
          return res.status(400).json({
            error: `conversation_history[${i}].content must be a string`
          });
        }
      }
    }

    const chatService = getChatService();
    
    // Determine which greeting message to use based on whether there are previous messages
    let greetingMessage: string;
    
    // Convert conversation_history to previous_messages format if needed (for backward compatibility)
    const messagesToFormat = conversation_history 
      ? conversation_history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'ai' as 'user' | 'ai',
          content: msg.content
        }))
      : previous_messages;
    
    if (messagesToFormat && messagesToFormat.length > 0) {
      // User is returning to an existing chat - format previous messages
      const formattedMessages = messagesToFormat
        .map((msg, index) => {
          const speaker = msg.role === 'user' ? 'User' : 'You (the character)';
          return `${speaker}: ${msg.content}`;
        })
        .join('\n');
      
      greetingMessage = `[The user has returned, greet the user again understanding that they've come back, these are the previous messages between you: ${formattedMessages}]`;
    } else {
      // New chat - use the original greeting
      greetingMessage = "I just walked in on you, greet me and conversationally tell me a little about what you're up to as if I was a friend";
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
        // Use conversation_history if provided, otherwise fall back to just the greeting pair
        let historyForPreprompts: ConversationMessage[];
        
        if (conversation_history && conversation_history.length > 0) {
          // Add the greeting exchange to the conversation history
          historyForPreprompts = [
            ...conversation_history,
            { role: 'user' as const, content: greetingMessage },
            { role: 'assistant' as const, content: chatResponse.text_response_cleaned || chatResponse.ai || '' }
          ].slice(-8) as ConversationMessage[]; // Keep only last 8 messages (4 pairs)
        } else {
          // Fall back to just the greeting pair
          historyForPreprompts = [
            { role: 'user' as const, content: greetingMessage },
            { role: 'assistant' as const, content: chatResponse.text_response_cleaned || chatResponse.ai || '' }
          ];
        }
        
        preprompts = await chatService.generatePreprompts(
          historyForPreprompts,
          config_id
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

// POST /api/characters/:config_id/verify-password - Verify password and get access token
router.post('/characters/:config_id/verify-password', async (req: Request, res: Response) => {
  try {
    const { config_id } = req.params;
    const { password } = req.body;

    if (!config_id) {
      return res.status(400).json({ error: 'config_id is required' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'password is required' });
    }

    // Check if character exists
    if (!characterExists(config_id)) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const passwordService = getPasswordService();

    // Check if character has a password
    if (!passwordService.hasPassword(config_id)) {
      return res.status(400).json({ 
        success: false,
        error: 'Character does not require a password' 
      });
    }

    // Verify password
    if (!passwordService.verifyPassword(config_id, password)) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid password' 
      });
    }

    // Generate access token
    const tokenInfo = passwordService.generateAccessToken(config_id);

    res.json({
      success: true,
      access_token: tokenInfo.token,
      expires_at: tokenInfo.expires_at,
      ttl_seconds: tokenInfo.ttl_seconds,
      password_required: true,
    });
  } catch (error: any) {
    console.error('Error verifying password:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify password',
      message: error.message
    });
  }
});

// POST /api/followups - Generate contextual follow-up options
router.post('/followups', async (req: Request, res: Response) => {
  try {
    const { conversation_history, user_turn, assistant_turn, config_id } = req.body as FollowUpsRequest;

    // Validate input: either conversation_history or user_turn + assistant_turn must be provided
    if (conversation_history) {
      // Validate conversation_history structure
      if (!Array.isArray(conversation_history)) {
        return res.status(400).json({
          error: 'conversation_history must be an array'
        });
      }
      
      // Limit to 8 messages (4 pairs total)
      if (conversation_history.length > 8) {
        return res.status(400).json({
          error: 'conversation_history can contain at most 8 messages (4 pairs total)'
        });
      }
      
      // Validate each message has role and content fields
      for (let i = 0; i < conversation_history.length; i++) {
        const message = conversation_history[i];
        if (!message || typeof message !== 'object') {
          return res.status(400).json({
            error: `conversation_history[${i}] must be an object`
          });
        }
        if (message.role !== 'user' && message.role !== 'assistant') {
          return res.status(400).json({
            error: `conversation_history[${i}].role must be either 'user' or 'assistant'`,
            received: message.role,
            receivedType: typeof message.role,
            hint: message.role === 'ai' ? 'Use "assistant" instead of "ai"' : undefined
          });
        }
        if (typeof message.content !== 'string') {
          return res.status(400).json({
            error: `conversation_history[${i}].content must be a string`
          });
        }
      }
    } else if (user_turn && assistant_turn) {
      // Legacy support: convert single pair to conversation_history format
      // This maintains backward compatibility
    } else {
      return res.status(400).json({
        error: 'Either conversation_history (up to 8 messages) or user_turn + assistant_turn must be provided'
      });
    }

    const chatService = getChatService();
    const preprompts = await chatService.getFollowUps(
      conversation_history,
      user_turn,
      assistant_turn,
      config_id
    );

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
