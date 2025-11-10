import fetch from 'node-fetch';
import {
  ChatRequest,
  ChatResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  ConfigResponse,
  Preprompt,
  PrepromptPayload
} from '../types/chat';
import { TokenRefreshService } from './tokenRefreshService';

const BASE_URL = 'https://chat.dev.genies.com';
const PREPROMPT_MODEL = process.env.PREPROMPT_MODEL || 'gpt-4o-mini';
const PREPROMPT_ENDPOINT =
  process.env.PREPROMPT_ENDPOINT || `${BASE_URL}/v1/llm/infer`;
const PREPROMPT_TEMPERATURE =
  process.env.PREPROMPT_TEMPERATURE !== undefined
    ? Number(process.env.PREPROMPT_TEMPERATURE)
    : 0.7;
const PREPROMPT_MAX_TOKENS =
  process.env.PREPROMPT_MAX_TOKENS !== undefined
    ? Number(process.env.PREPROMPT_MAX_TOKENS)
    : 400;

const PREPROMPT_INSTRUCTION = `
Generate four short contextual pre-prompts — natural next things a user might say based on the most recent conversation (the last user message and the last AI message).

STRICT OUTPUT:

Return ONLY valid JSON exactly in this shape and order:

{

  "preprompts": [

    {"type": "roleplay", "prompt": "Full preprompt text 1", "simplified_text": "Short version"},

      {"type": "roleplay", "prompt": "Full preprompt text 2", "simplified_text": "Short version"},

      {"type": "conversation", "prompt": "Full preprompt text 3", "simplified_text": "Short version"},

      {"type": "conversation", "prompt": "Full preprompt text 4", "simplified_text": "Short version"}

  ]

}

Rules:

- Exactly 4 items, in the exact order: first 2 roleplaying/action-driven, next 2 conversational/curiosity-driven.

- short: ≤ 10 words; no emojis; no quotes; only optional “?” allowed.

- prompt: 1–2 natural sentences expanding the same intent; no emojis.

- No extra fields, text, or comments outside the JSON.

- Each option must point to a distinct emotion or next beat (e.g., bold vs cautious, intrigued vs skeptical).

- Match the character’s voice and current context; avoid generic filler like “continue” or “tell me more.”

Tone:

- Feels like 2 AM TikTok/YouTube rabbit hole: casual, curious, impulsive, emotionally distinct.

Type definitions & examples (for style only; DO NOT include these in output):

ROLEPLAY / ACTION (first two):

  Example A:

    short: "peek around the corner"

    prompt: "You edge closer and carefully peek around the corner to see what’s making the sound."

  Example B:

    short: "grab the flashlight"

    prompt: "You snatch the flashlight and sweep the beam across the room, checking every shadow."

CONVERSATIONAL / CURIOSITY (last two):

  Example C:

    short: "is that actually true?"

    prompt: "Wait—seriously? Is that actually true, or am I missing context?"

  Example D:

    short: "why would that work?"

    prompt: "That’s surprising—can you explain why that would work in this situation?"

Return only the JSON object in the required order and shape.
`.trim();

export class ChatService {
  private tokenRefreshService: TokenRefreshService | null = null;

  constructor(tokenRefreshService?: TokenRefreshService) {
    this.tokenRefreshService = tokenRefreshService || null;
  }

  /**
   * Set token refresh service after initialization
   */
  setTokenRefreshService(tokenRefreshService: TokenRefreshService): void {
    this.tokenRefreshService = tokenRefreshService;
  }

  /**
   * Get valid access token (refreshes if needed)
   */
  private async getValidToken(): Promise<string> {
    if (!this.tokenRefreshService) {
      throw new Error('Token refresh service not initialized');
    }
    return await this.tokenRefreshService.getValidAccessToken();
  }

  private async api<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: any
  ): Promise<T> {
    try {
      // Get valid token (will refresh if needed)
      const token = await this.getValidToken();

      const options: any = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, options);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} ${errorText}`);
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      return data;
    } catch (error) {
      console.error(`[${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  async getConfig(configId: string): Promise<ConfigResponse> {
    return this.api<ConfigResponse>(`/genie/config/${configId}`);
  }

  async createSession(request: CreateSessionRequest): Promise<CreateSessionResponse> {
    return this.api<CreateSessionResponse>('/v2/chat/sessions', 'POST', request);
  }

  async sendChat(request: ChatRequest): Promise<ChatResponse> {
    return this.api<ChatResponse>('/v2/chat', 'POST', request);
  }

  /**
   * Get multiple character configs at once
   */
  async getConfigs(configIds: string[]): Promise<Record<string, ConfigResponse>> {
    // Fetch all configs in parallel
    const configPromises = configIds.map(async (configId) => {
      try {
        const config = await this.getConfig(configId);
        return { configId, config };
      } catch (error) {
        console.error(`Failed to fetch config for ${configId}:`, error);
        return { configId, config: null, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    const results = await Promise.all(configPromises);
    
    // Build a map of configId -> config
    const configMap: Record<string, ConfigResponse> = {};
    results.forEach(({ configId, config }) => {
      if (config) {
        configMap[configId] = config;
      }
    });

    return configMap;
  }

  /**
   * Get available characters with their full configs
   * Used to expose available characters to frontend
   */
  async getAvailableCharactersWithConfigs(characterIds: string[]): Promise<any[]> {
    const configs = await this.getConfigs(characterIds);
    
    // Return array of characters with their configs
    return characterIds
      .map(configId => ({
        config_id: configId,
        config: configs[configId] || null,
      }))
      .filter(char => char.config !== null);
  }

  /**
   * Generate contextual pre-prompts via gpt-5-mini using LLM Gateway API
   */
  async generatePreprompts(userTurn: string, assistantTurn: string): Promise<Preprompt[]> {
    try {
      const token = await this.getValidToken();

      const context = [
        `Last user message:\n${userTurn}`.trim(),
        `Last AI message:\n${assistantTurn}`.trim(),
      ]
        .filter(Boolean)
        .join('\n\n');

      // Use LLM Gateway API format
      const fullPrompt = `${PREPROMPT_INSTRUCTION}\n\n${context}`;
      
      // Try LLM Gateway API format with model and prompt
      const payload: any = {
        model: PREPROMPT_MODEL,
        prompt: fullPrompt,
        temperature: PREPROMPT_TEMPERATURE,
        max_tokens: PREPROMPT_MAX_TOKENS,
        response_format: { type: 'json_object' },
      };

      const response = await fetch(PREPROMPT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[generatePreprompts] API Error: ${response.status}`, {
          endpoint: PREPROMPT_ENDPOINT,
          model: PREPROMPT_MODEL,
          error: errorText.substring(0, 200),
        });
        throw new Error(`Preprompt generation failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      // LLM Gateway API returns { data: { response: "..." } }
      // Try multiple response formats
      const content =
        data?.choices?.[0]?.message?.content ??
        data?.data?.response ??
        data?.response ??
        data?.data?.content ??
        null;

      if (!content || typeof content !== 'string') {
        throw new Error('Preprompt generation returned empty content');
      }

      let parsed: PrepromptPayload;
      try {
        // Content might already be parsed JSON or a string
        parsed = typeof content === 'string' ? JSON.parse(content) : content;
      } catch (error) {
        throw new Error(`Failed to parse preprompt JSON: ${(error as Error).message}`);
      }

      if (!parsed?.preprompts || !Array.isArray(parsed.preprompts)) {
        throw new Error('Preprompt payload missing required preprompts array');
      }

      const sanitized = parsed.preprompts
        .filter(
          (item): item is Preprompt =>
            item != null &&
            (item.type === 'roleplay' || item.type === 'conversation') &&
            typeof item.prompt === 'string' &&
            typeof item.simplified_text === 'string'
        )
        .slice(0, 4);

      if (sanitized.length !== 4) {
        throw new Error('Expected exactly 4 preprompts from generator');
      }

      return sanitized;
    } catch (error) {
      console.error('[generatePreprompts] Falling back to local suggestions:', error);
      return this.buildFallbackPreprompts(userTurn, assistantTurn);
    }
  }

  /**
   * Call LLM Gateway API to generate contextual follow-ups
   */
  async getFollowUps(userTurn: string, assistantTurn: string): Promise<Preprompt[]> {
    return this.generatePreprompts(userTurn, assistantTurn);
  }

  private buildFallbackPreprompts(userTurn: string, assistantTurn: string): Preprompt[] {
    const lastUser = userTurn?.trim() || 'the last thing you said';
    const lastAssistant = assistantTurn?.trim() || 'that last reply';

    return [
      {
        type: 'roleplay',
        prompt: `You ride the rush from ${lastAssistant.toLowerCase()} and dare them to notch the energy even higher.`,
        simplified_text: 'go bigger',
      },
      {
        type: 'roleplay',
        prompt: `You pivot fast, acting on instinct, and tease a wild next move based on how you felt when you said "${lastUser}".`,
        simplified_text: 'switch lanes',
      },
      {
        type: 'conversation',
        prompt: `Hold up—that response has you curious. Ask directly what surprised them most about ${lastAssistant.toLowerCase()}.`,
        simplified_text: 'wait really?',
      },
      {
        type: 'conversation',
        prompt: `Stay up late brain: press them for the why behind it all, keeping the mood casual but insistent.`,
        simplified_text: 'tell me why',
      },
    ];
  }
}

// Singleton instance that will be initialized with token refresh service
let chatServiceInstance: ChatService | null = null;

export function initChatService(tokenRefreshService: TokenRefreshService): void {
  chatServiceInstance = new ChatService(tokenRefreshService);
}

export function getChatService(): ChatService {
  if (!chatServiceInstance) {
    throw new Error('ChatService not initialized. Call initChatService first.');
  }
  return chatServiceInstance;
}
