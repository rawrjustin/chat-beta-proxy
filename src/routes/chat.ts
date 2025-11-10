import { Router, Request, Response } from 'express';
import { getChatService } from '../services/chatService';
import { ProxyChatRequest, CreateSessionRequest, GetConfigsRequest, FollowUpsRequest, Preprompt } from '../types/chat';
import { getAvailableCharacters, getAvailableCharacterIds } from '../config/characters';

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
      const character = {
        config_id, // Always use the hardcoded config_id from our definitions
        name: definition.name,
        description: definition.description,
        display_order: definition.display_order,
        avatar_url: definition.avatar_url,
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

    res.json(session);
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

    // Return simplified response to frontend
    res.json({
      ai: response.ai,
      session_id: response.session.id,
      request_id: response.request_id,
      text_response_cleaned: response.text_response_cleaned,
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
