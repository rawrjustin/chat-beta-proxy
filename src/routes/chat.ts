import { Router, Request, Response } from 'express';
import { getChatService } from '../services/chatService';
import { ProxyChatRequest, CreateSessionRequest } from '../types/chat';

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

    // Return simplified response to frontend
    res.json({
      ai: response.ai,
      session_id: response.session.id,
      request_id: response.request_id,
      text_response_cleaned: response.text_response_cleaned,
      warning_message: response.warning_message,
    });
  } catch (error: any) {
    console.error('Error sending chat:', error);
    res.status(500).json({
      error: 'Failed to send chat message',
      message: error.message
    });
  }
});

export default router;
