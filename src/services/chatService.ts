import fetch from 'node-fetch';
import {
  ChatRequest,
  ChatResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  ConfigResponse,
  Preprompt,
  PrepromptPayload,
  ConversationMessage
} from '../types/chat';
import { TokenRefreshService } from './tokenRefreshService';

const BASE_URL = 'https://chat.dev.genies.com';
const PREPROMPT_MODEL = process.env.PREPROMPT_MODEL || 'gpt-4o-mini';
// Use LLM Gateway API with predefined prompt
const PREPROMPT_ENDPOINT =
  process.env.PREPROMPT_ENDPOINT || `${BASE_URL}/v1/llm/infer`;
const PREPROMPT_NAME = process.env.PREPROMPT_NAME || 'contextual_followups_v1';
const DOGMA_CONFIG_ID = 'CHAR_dbafb670-8b2b-4d58-ac81-2b2f4058f44e';
// Shawn Mendes character IDs (both variants)
const SHAWN_MENDES_CONFIG_IDS = [
  'CHAR_195be96c-e510-41b9-ae13-ad08514a6086',
];
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

// Simple in-memory cache for character configs
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class SimpleCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private ttl: number; // Time to live in milliseconds

  constructor(ttlMinutes: number = 30) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export class ChatService {
  private tokenRefreshService: TokenRefreshService | null = null;
  private configCache: SimpleCache<ConfigResponse>;
  private cacheEnabled: boolean;

  constructor(tokenRefreshService?: TokenRefreshService) {
    this.tokenRefreshService = tokenRefreshService || null;
    // Cache configs - TTL configurable via env var (default: 30 minutes)
    // Set CONFIG_CACHE_TTL_MINUTES=0 to disable caching
    const cacheTtlMinutes = process.env.CONFIG_CACHE_TTL_MINUTES 
      ? parseInt(process.env.CONFIG_CACHE_TTL_MINUTES, 10) 
      : 30;
    this.cacheEnabled = cacheTtlMinutes > 0;
    this.configCache = new SimpleCache<ConfigResponse>(cacheTtlMinutes);
    
    // Clean up expired cache entries every 10 minutes (if caching enabled)
    if (this.cacheEnabled) {
      setInterval(() => {
        this.configCache.cleanup();
      }, 10 * 60 * 1000);
    }
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
      // Reduced logging to save memory
      if (process.env.DEBUG_LOGGING === 'true') {
        console.log(`[${requestId}] Starting request:`, {
          endpoint,
          method,
          hasBody: !!body,
          bodySize: body ? JSON.stringify(body).length : 0,
          timeout: API_TIMEOUT,
        });
      }

      // Get valid token (will refresh if needed)
      const tokenStartTime = Date.now();
      const token = await this.getValidToken();
      const tokenTime = Date.now() - tokenStartTime;
      if (process.env.DEBUG_LOGGING === 'true' && tokenTime > 100) {
        console.log(`[${requestId}] Token obtained in ${tokenTime}ms`);
      }

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
      
      // Only log headers in debug mode (they can be large)
      if (process.env.DEBUG_LOGGING === 'true') {
        console.log(`[${requestId}] Response received:`, {
          status: response.status,
          statusText: response.statusText,
          fetchTime: `${fetchTime}ms`,
          totalTime: `${Date.now() - startTime}ms`,
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        // Limit error text to save memory
        const errorPreview = errorText.length > 500 ? errorText.substring(0, 500) + '...' : errorText;
        
        // For 404s on config endpoints, these are expected (some characters don't exist upstream)
        // Only log as warning in debug mode, not as error
        const isConfigEndpoint = endpoint.startsWith('/genie/config/');
        const isNotFound = response.status === 404;
        
        if (isConfigEndpoint && isNotFound) {
          // Only log in debug mode for config 404s
          if (process.env.DEBUG_LOGGING === 'true') {
            console.warn(`[${requestId}] Config not found (expected for some characters):`, {
              status: response.status,
              endpoint,
              totalTime: `${Date.now() - startTime}ms`,
            });
          }
        } else {
          // Log other errors normally
          console.error(`[${requestId}] Request failed:`, {
            status: response.status,
            statusText: response.statusText,
            error: errorPreview,
            totalTime: `${Date.now() - startTime}ms`,
          });
        }
        
        throw new Error(`Request failed: ${response.status} ${errorPreview}`);
      }

      const readStartTime = Date.now();
      const text = await response.text();
      const readTime = Date.now() - readStartTime;
      
      // Limit response size to prevent memory issues (50MB max)
      const MAX_RESPONSE_SIZE = 50 * 1024 * 1024; // 50MB
      if (text.length > MAX_RESPONSE_SIZE) {
        throw new Error(`Response too large: ${text.length} bytes (max: ${MAX_RESPONSE_SIZE})`);
      }
      
      const data = text ? JSON.parse(text) : null;
      
      const totalTime = Date.now() - startTime;
      // Only log detailed timing in debug mode
      if (process.env.DEBUG_LOGGING === 'true') {
        console.log(`[${requestId}] Request completed:`, {
          responseSize: text.length,
          readTime: `${readTime}ms`,
          totalTime: `${totalTime}ms`,
        });
      } else if (totalTime > 5000) {
        // Only log slow requests in production
        console.log(`[${requestId}] Slow request: ${totalTime}ms (${endpoint})`);
      }
      
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
      
      // For 404s on config endpoints, these are expected - don't log as error
      const isConfigEndpoint = endpoint.startsWith('/genie/config/');
      const isNotFound = error.message && (
        error.message.includes('404') || 
        error.message.includes('not found') ||
        error.message.includes('Not Found')
      );
      
      if (isConfigEndpoint && isNotFound) {
        // Only log in debug mode for config 404s
        if (process.env.DEBUG_LOGGING === 'true') {
          console.warn(`[${requestId}] Config not found (expected):`, {
            endpoint,
            totalTime: `${totalTime}ms`,
          });
        }
      } else {
        // Log other errors normally
        console.error(`[${requestId}] Request error:`, {
          error: error.message,
          errorName: error.name,
          errorStack: error.stack?.substring(0, 500),
          totalTime: `${totalTime}ms`,
          endpoint,
          method,
        });
      }
      
      throw error;
    }
  }

  async getConfig(configId: string): Promise<ConfigResponse> {
    // Check cache first (if caching enabled)
    if (this.cacheEnabled) {
      const cached = this.configCache.get(configId);
      if (cached) {
        return cached;
      }
    }

    try {
      // Fetch from API
      const config = await this.api<ConfigResponse>(`/genie/config/${configId}`);
      
      // Cache the result (if caching enabled)
      if (this.cacheEnabled) {
        this.configCache.set(configId, config);
      }
      
      return config;
    } catch (error: any) {
      // Check if this is a 404 error (config not found)
      const isNotFound = error.message && (
        error.message.includes('404') || 
        error.message.includes('not found') ||
        error.message.includes('Not Found')
      );
      
      if (isNotFound) {
        // Create a specific error type for 404s that can be caught and handled gracefully
        const notFoundError = new Error(`Config not found: ${configId}`);
        (notFoundError as any).isNotFound = true;
        (notFoundError as any).statusCode = 404;
        throw notFoundError;
      }
      
      // Re-throw other errors
      throw error;
    }
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
      } catch (error: any) {
        // Handle 404s gracefully - these are expected for characters that don't exist upstream
        if (error?.isNotFound || (error?.message && (
          error.message.includes('404') || 
          error.message.includes('not found') ||
          error.message.includes('Not Found')
        ))) {
          // Only log as warning in debug mode, not as error
          if (process.env.DEBUG_LOGGING === 'true') {
            console.warn(`Config not found for ${configId} (this is expected for some characters)`);
          }
        } else {
          // Log other errors normally
          console.error(`Failed to fetch config for ${configId}:`, error);
        }
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
   * @param conversationHistory - Array of messages with role and content (up to 8 messages, 4 pairs total)
   * @param configId - Optional character config ID to determine which prompt to use
   */
  async generatePreprompts(conversationHistory: ConversationMessage[], configId?: string): Promise<Preprompt[]> {
    const prepromptStartTime = Date.now();
    const prepromptRequestId = `preprompt_${prepromptStartTime}`;
    
    try {
      const token = await this.getValidToken();

      // Use specific prompts for certain characters, default for all others
      let promptName = PREPROMPT_NAME;
      if (configId === DOGMA_CONFIG_ID) {
        promptName = 'contextual_followups_v1_vulgar';
      } else if (configId && SHAWN_MENDES_CONFIG_IDS.includes(configId)) {
        promptName = 'contextual_followups_v1_liveobjective';
      }

      // Use LLM Gateway API format with predefined prompt_name
      // The prompt template 'contextual_followups_v1' should handle the instruction formatting
      // Now using conversation_history instead of user_turn and assistant_turn
      // Use label: "dev" to ensure we use the dev-tagged version instead of latest
      const payload: any = {
        model: PREPROMPT_MODEL,
        prompt_name: promptName,
        label: 'dev',
        inputs: {
          conversation_history: conversationHistory,
        },
        temperature: PREPROMPT_TEMPERATURE,
        max_tokens: PREPROMPT_MAX_TOKENS,
        response_format: { type: 'json_object' },
      };
      
      // Reduced logging - only log in debug mode
      if (process.env.DEBUG_LOGGING === 'true') {
        console.log(`[${prepromptRequestId}] [generatePreprompts] Request:`, {
          endpoint: PREPROMPT_ENDPOINT,
          model: PREPROMPT_MODEL,
          prompt_name: promptName,
          label: 'dev',
          configId: configId || 'none',
          conversationHistoryPairs: conversationHistory.length,
          timeout: PREPROMPT_TIMEOUT,
        });
      }

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
      
      // Only log in debug mode
      if (process.env.DEBUG_LOGGING === 'true') {
        console.log(`[${prepromptRequestId}] Preprompt response:`, {
          status: response.status,
          fetchTime: `${fetchTime}ms`,
          totalTime: `${Date.now() - prepromptStartTime}ms`,
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        const totalTime = Date.now() - prepromptStartTime;
        // Limit error logging to save memory
        const errorPreview = errorText.length > 500 ? errorText.substring(0, 500) + '...' : errorText;
        console.error(`[${prepromptRequestId}] [generatePreprompts] API Error: ${response.status}`, {
          endpoint: PREPROMPT_ENDPOINT,
          status: response.status,
          error: errorPreview,
          totalTime: `${totalTime}ms`,
        });
        throw new Error(`Preprompt generation failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      // Log raw response structure for debugging (always log this when there's an issue)
      console.log(`[${prepromptRequestId}] [generatePreprompts] Raw API response structure:`, {
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        hasChoices: !!data?.choices,
        choicesLength: data?.choices?.length || 0,
        hasDataResponse: !!data?.data?.response,
        hasResponse: !!data?.response,
        hasDataContent: !!data?.data?.content,
      });
      
      // LLM Gateway API returns { data: { response: "..." } }
      // Try multiple response formats
      const content =
        data?.choices?.[0]?.message?.content ??
        data?.data?.response ??
        data?.response ??
        data?.data?.content ??
        null;

      // Log content extraction (always log when debugging preprompts)
      console.log(`[${prepromptRequestId}] [generatePreprompts] Extracted content:`, {
        hasContent: !!content,
        contentLength: typeof content === 'string' ? content.length : 0,
        contentPreview: typeof content === 'string' ? content.substring(0, 200) : 'not a string',
      });

      if (!content || typeof content !== 'string') {
        // Only stringify in debug mode to save memory
        const errorData = process.env.DEBUG_LOGGING === 'true' 
          ? JSON.stringify(data).substring(0, 500)
          : 'data present but invalid';
        console.error('[generatePreprompts] No valid content found in response:', {
          data: errorData,
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
        if (process.env.DEBUG_LOGGING === 'true') {
          console.log('[generatePreprompts] Stripped markdown code blocks');
        }
      }

      let parsed: PrepromptPayload;
      try {
        // Parse the cleaned JSON content
        parsed = typeof cleanedContent === 'string' ? JSON.parse(cleanedContent) : cleanedContent;
        // Always log parsed structure when debugging preprompts
        console.log(`[${prepromptRequestId}] [generatePreprompts] Parsed JSON:`, {
          hasParsed: !!parsed,
          parsedKeys: parsed ? Object.keys(parsed) : [],
          prepromptsCount: parsed?.preprompts?.length || 0,
          prepromptsIsArray: Array.isArray(parsed?.preprompts),
          prepromptsPreview: parsed?.preprompts ? JSON.stringify(parsed.preprompts.slice(0, 2)).substring(0, 300) : 'none',
        });
      } catch (error) {
        console.error(`[${prepromptRequestId}] [generatePreprompts] JSON parse error:`, {
          error: (error as Error).message,
          contentPreview: content.substring(0, 500),
          cleanedContentPreview: cleanedContent.substring(0, 500),
        });
        throw new Error(`Failed to parse preprompt JSON: ${(error as Error).message}`);
      }

      if (!parsed?.preprompts || !Array.isArray(parsed.preprompts)) {
        // Always log full structure when there's an error
        const errorData = JSON.stringify(parsed).substring(0, 1000);
        console.error(`[${prepromptRequestId}] [generatePreprompts] Invalid preprompts structure:`, {
          parsed: errorData,
          parsedType: typeof parsed,
          hasPreprompts: !!parsed?.preprompts,
          prepromptsType: typeof parsed?.preprompts,
          isArray: Array.isArray(parsed?.preprompts),
        });
        throw new Error('Preprompt payload missing required preprompts array');
      }

      // Log before filtering to see what we're working with
      console.log(`[${prepromptRequestId}] [generatePreprompts] Before filtering:`, {
        rawCount: parsed.preprompts.length,
        rawItems: parsed.preprompts.map((item, idx) => ({
          index: idx,
          hasItem: !!item,
          type: item?.type,
          hasPrompt: typeof item?.prompt === 'string',
          hasSimplifiedText: typeof item?.simplified_text === 'string',
          promptLength: typeof item?.prompt === 'string' ? item.prompt.length : 0,
          simplifiedTextLength: typeof item?.simplified_text === 'string' ? item.simplified_text.length : 0,
        })),
      });

      const sanitized = parsed.preprompts
        .map((item) => {
          // Normalize type to lowercase for comparison
          if (item && typeof item.type === 'string') {
            const normalizedType = item.type.toLowerCase();
            // Only normalize if it's a valid type
            if (normalizedType === 'roleplay' || normalizedType === 'conversation') {
              return {
                ...item,
                type: normalizedType as 'roleplay' | 'conversation',
              };
            }
          }
          return item;
        })
        .filter(
          (item): item is Preprompt =>
            item != null &&
            (item.type === 'roleplay' || item.type === 'conversation') &&
            typeof item.prompt === 'string' &&
            typeof item.simplified_text === 'string'
        )
        .slice(0, 4);

      // Log what was filtered out (using same normalization logic)
      const filteredOut = parsed.preprompts.filter(
        (item) => {
          const normalizedType = item?.type?.toLowerCase();
          return !(
            item != null &&
            (normalizedType === 'roleplay' || normalizedType === 'conversation') &&
            typeof item.prompt === 'string' &&
            typeof item.simplified_text === 'string'
          );
        }
      );

      if (filteredOut.length > 0) {
        console.warn(`[${prepromptRequestId}] [generatePreprompts] Filtered out ${filteredOut.length} invalid preprompts:`, {
          filteredItems: filteredOut.map((item, idx) => ({
            index: idx,
            item: JSON.stringify(item).substring(0, 200),
            reasons: {
              isNull: item == null,
              wrongType: item?.type !== 'roleplay' && item?.type !== 'conversation',
              promptNotString: typeof item?.prompt !== 'string',
              simplifiedTextNotString: typeof item?.simplified_text !== 'string',
            },
          })),
        });
      }

      if (sanitized.length !== 4) {
        console.error(`[${prepromptRequestId}] [generatePreprompts] Wrong number of preprompts:`, {
          expected: 4,
          got: sanitized.length,
          rawCount: parsed.preprompts.length,
          filteredOut: filteredOut.length,
          sanitizedItems: sanitized.map((item, idx) => ({
            index: idx,
            type: item.type,
            prompt: item.prompt.substring(0, 50),
            simplified_text: item.simplified_text,
          })),
        });
        throw new Error('Expected exactly 4 preprompts from generator');
      }
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
      
      console.error(`[${prepromptRequestId}] [generatePreprompts] Failed to generate preprompts:`, {
        error: error instanceof Error ? error.message : String(error),
        errorName: error?.name,
        stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
        totalTime: `${totalTime}ms`,
      });
      // Return empty array instead of fallback preprompts
      return [];
    }
  }

  /**
   * Call LLM Gateway API to generate contextual follow-ups
   * @param conversationHistory - Array of messages with role and content (up to 8 messages, 4 pairs total)
   * @param userTurn - Legacy: The user's message (used if conversationHistory not provided)
   * @param assistantTurn - Legacy: The assistant's response (used if conversationHistory not provided)
   * @param configId - Optional character config ID to determine which prompt to use
   */
  async getFollowUps(
    conversationHistory?: ConversationMessage[],
    userTurn?: string,
    assistantTurn?: string,
    configId?: string
  ): Promise<Preprompt[]> {
    // If conversation_history is provided, use it; otherwise fall back to legacy single pair
    if (conversationHistory && conversationHistory.length > 0) {
      return this.generatePreprompts(conversationHistory, configId);
    } else if (userTurn && assistantTurn) {
      // Legacy support: convert single pair to conversation_history format
      return this.generatePreprompts([
        { role: 'user', content: userTurn },
        { role: 'assistant', content: assistantTurn }
      ], configId);
    } else {
      throw new Error('Either conversation_history or user_turn + assistant_turn must be provided');
    }
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
