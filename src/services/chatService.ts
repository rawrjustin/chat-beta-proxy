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
// Use LLM Gateway API with predefined prompt
const PREPROMPT_ENDPOINT =
  process.env.PREPROMPT_ENDPOINT || `${BASE_URL}/v1/llm/infer`;
const PREPROMPT_NAME = process.env.PREPROMPT_NAME || 'contextual_followups_v1_vulgar';
const PREPROMPT_TEMPERATURE =
  process.env.PREPROMPT_TEMPERATURE !== undefined
    ? Number(process.env.PREPROMPT_TEMPERATURE)
    : 0.7;
const PREPROMPT_MAX_TOKENS =
  process.env.PREPROMPT_MAX_TOKENS !== undefined
    ? Number(process.env.PREPROMPT_MAX_TOKENS)
    : 400;

// Timeout configuration (in milliseconds)
const API_TIMEOUT = process.env.API_TIMEOUT 
  ? Number(process.env.API_TIMEOUT) 
  : 120000; // Default: 120 seconds (2 minutes)
const PREPROMPT_TIMEOUT = process.env.PREPROMPT_TIMEOUT
  ? Number(process.env.PREPROMPT_TIMEOUT)
  : 30000; // Default: 30 seconds for preprompt generation

/**
 * Create a timeout promise that rejects after the specified time
 */
function createTimeoutPromise(timeoutMs: number, requestId: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });
}

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
    const startTime = Date.now();
    const requestId = `${method}_${endpoint}_${startTime}`;
    
    try {
      console.log(`[${requestId}] Starting request:`, {
        endpoint,
        method,
        hasBody: !!body,
        bodySize: body ? JSON.stringify(body).length : 0,
        timeout: API_TIMEOUT,
      });

      // Get valid token (will refresh if needed)
      const tokenStartTime = Date.now();
      const token = await this.getValidToken();
      const tokenTime = Date.now() - tokenStartTime;
      console.log(`[${requestId}] Token obtained in ${tokenTime}ms`);

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

      const fetchStartTime = Date.now();
      // Use Promise.race to implement timeout for node-fetch v2
      const response = await Promise.race([
        fetch(`${BASE_URL}${endpoint}`, options),
        createTimeoutPromise(API_TIMEOUT, requestId),
      ]) as any;
      const fetchTime = Date.now() - fetchStartTime;
      
      console.log(`[${requestId}] Response received:`, {
        status: response.status,
        statusText: response.statusText,
        fetchTime: `${fetchTime}ms`,
        totalTime: `${Date.now() - startTime}ms`,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorTextStart = Date.now();
        const errorText = await response.text();
        const errorTextTime = Date.now() - errorTextStart;
        
        console.error(`[${requestId}] Request failed:`, {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 500),
          errorTextReadTime: `${errorTextTime}ms`,
          totalTime: `${Date.now() - startTime}ms`,
        });
        
        throw new Error(`Request failed: ${response.status} ${errorText}`);
      }

      const readStartTime = Date.now();
      const text = await response.text();
      const readTime = Date.now() - readStartTime;
      const data = text ? JSON.parse(text) : null;
      
      const totalTime = Date.now() - startTime;
      console.log(`[${requestId}] Request completed successfully:`, {
        responseSize: text.length,
        readTime: `${readTime}ms`,
        totalTime: `${totalTime}ms`,
        tokenTime: `${tokenTime}ms`,
        fetchTime: `${fetchTime}ms`,
      });
      
      return data;
    } catch (error: any) {
      const totalTime = Date.now() - startTime;
      
      if (error.message && error.message.includes('timeout')) {
        console.error(`[${requestId}] Request timeout:`, {
          timeout: API_TIMEOUT,
          totalTime: `${totalTime}ms`,
          endpoint,
          method,
          error: error.message,
        });
        throw new Error(`Request timeout after ${API_TIMEOUT}ms: ${endpoint}`);
      }
      
      console.error(`[${requestId}] Request error:`, {
        error: error.message,
        errorName: error.name,
        errorStack: error.stack?.substring(0, 500),
        totalTime: `${totalTime}ms`,
        endpoint,
        method,
      });
      
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
   * Generate contextual pre-prompts via gpt-4o-mini using LLM Gateway API
   */
  async generatePreprompts(userTurn: string, assistantTurn: string): Promise<Preprompt[]> {
    const prepromptStartTime = Date.now();
    const prepromptRequestId = `preprompt_${prepromptStartTime}`;
    
    try {
      const token = await this.getValidToken();

      // Use LLM Gateway API format with predefined prompt_name
      // The prompt template 'contextual_followups_v1' should handle the instruction formatting
      const payload: any = {
        model: PREPROMPT_MODEL,
        prompt_name: PREPROMPT_NAME,
        inputs: {
          user_turn: userTurn,
          assistant_turn: assistantTurn,
        },
        temperature: PREPROMPT_TEMPERATURE,
        max_tokens: PREPROMPT_MAX_TOKENS,
        response_format: { type: 'json_object' },
      };
      
      console.log(`[${prepromptRequestId}] [generatePreprompts] Request details:`, {
        endpoint: PREPROMPT_ENDPOINT,
        model: PREPROMPT_MODEL,
        prompt_name: PREPROMPT_NAME,
        payloadKeys: Object.keys(payload),
        inputs: payload.inputs,
        hasToken: !!token,
        timeout: PREPROMPT_TIMEOUT,
      });

      const fetchStartTime = Date.now();
      // Use Promise.race to implement timeout for node-fetch v2
      const response = await Promise.race([
        fetch(PREPROMPT_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }),
        createTimeoutPromise(PREPROMPT_TIMEOUT, prepromptRequestId),
      ]) as any;
      const fetchTime = Date.now() - fetchStartTime;
      
      console.log(`[${prepromptRequestId}] Preprompt response received:`, {
        status: response.status,
        statusText: response.statusText,
        fetchTime: `${fetchTime}ms`,
        totalTime: `${Date.now() - prepromptStartTime}ms`,
      });

      if (!response.ok) {
        const errorText = await response.text();
        const totalTime = Date.now() - prepromptStartTime;
        console.error(`[${prepromptRequestId}] [generatePreprompts] API Error: ${response.status}`, {
          endpoint: PREPROMPT_ENDPOINT,
          model: PREPROMPT_MODEL,
          status: response.status,
          statusText: response.statusText,
          error: errorText.substring(0, 500),
          payload: JSON.stringify(payload).substring(0, 200),
          fetchTime: `${fetchTime}ms`,
          totalTime: `${totalTime}ms`,
        });
        throw new Error(`Preprompt generation failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('[generatePreprompts] Response received:', {
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        responseStructure: JSON.stringify(data).substring(0, 300),
      });
      
      // LLM Gateway API returns { data: { response: "..." } }
      // Try multiple response formats
      const content =
        data?.choices?.[0]?.message?.content ??
        data?.data?.response ??
        data?.response ??
        data?.data?.content ??
        null;

      console.log('[generatePreprompts] Extracted content:', {
        hasContent: !!content,
        contentType: typeof content,
        contentLength: typeof content === 'string' ? content.length : 0,
        contentPreview: typeof content === 'string' ? content.substring(0, 200) : null,
      });

      if (!content || typeof content !== 'string') {
        console.error('[generatePreprompts] No valid content found in response:', {
          data: JSON.stringify(data).substring(0, 500),
        });
        throw new Error('Preprompt generation returned empty content');
      }

      // Strip markdown code blocks if present (e.g., ```json ... ```)
      let cleanedContent = content.trim();
      const hadCodeBlock = cleanedContent.startsWith('```');
      if (hadCodeBlock) {
        // Remove opening code block marker (```json, ```, etc.)
        cleanedContent = cleanedContent.replace(/^```[a-z]*\n?/i, '');
        // Remove closing code block marker
        cleanedContent = cleanedContent.replace(/\n?```\s*$/i, '');
        cleanedContent = cleanedContent.trim();
        console.log('[generatePreprompts] Stripped markdown code blocks:', {
          originalLength: content.length,
          cleanedLength: cleanedContent.length,
          cleanedPreview: cleanedContent.substring(0, 200),
        });
      }

      let parsed: PrepromptPayload;
      try {
        // Parse the cleaned JSON content
        parsed = typeof cleanedContent === 'string' ? JSON.parse(cleanedContent) : cleanedContent;
        console.log('[generatePreprompts] Parsed JSON successfully:', {
          hasPreprompts: !!parsed?.preprompts,
          prepromptsCount: parsed?.preprompts?.length || 0,
        });
      } catch (error) {
        console.error('[generatePreprompts] JSON parse error:', {
          error: (error as Error).message,
          contentPreview: content.substring(0, 500),
        });
        throw new Error(`Failed to parse preprompt JSON: ${(error as Error).message}`);
      }

      if (!parsed?.preprompts || !Array.isArray(parsed.preprompts)) {
        console.error('[generatePreprompts] Invalid preprompts structure:', {
          parsed: JSON.stringify(parsed).substring(0, 500),
        });
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

      console.log('[generatePreprompts] Sanitized preprompts:', {
        originalCount: parsed.preprompts.length,
        sanitizedCount: sanitized.length,
        types: sanitized.map(p => p.type),
      });

      if (sanitized.length !== 4) {
        console.error('[generatePreprompts] Wrong number of preprompts:', {
          expected: 4,
          got: sanitized.length,
          preprompts: JSON.stringify(sanitized),
        });
        throw new Error('Expected exactly 4 preprompts from generator');
      }

      console.log('[generatePreprompts] Successfully generated preprompts');
      return sanitized;
    } catch (error: any) {
      const totalTime = Date.now() - prepromptStartTime;
      
      if (error.message && error.message.includes('timeout')) {
        console.error(`[${prepromptRequestId}] Preprompt request timeout:`, {
          timeout: PREPROMPT_TIMEOUT,
          totalTime: `${totalTime}ms`,
          endpoint: PREPROMPT_ENDPOINT,
          error: error.message,
        });
      }
      
      console.error(`[${prepromptRequestId}] [generatePreprompts] Falling back to local suggestions:`, {
        error: error instanceof Error ? error.message : String(error),
        errorName: error?.name,
        stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
        totalTime: `${totalTime}ms`,
      });
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
