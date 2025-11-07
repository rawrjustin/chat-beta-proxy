import fetch from 'node-fetch';
import {
  ChatRequest,
  ChatResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  ConfigResponse
} from '../types/chat';
import { TokenRefreshService } from './tokenRefreshService';

const BASE_URL = 'https://chat.dev.genies.com';

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
   * Call LLM Gateway API to generate contextual follow-ups
   */
  async getFollowUps(userTurn: string, assistantTurn: string): Promise<string[]> {
    try {
      const token = await this.getValidToken();

      const payload = {
        prompt_name: 'contextual_followups_v1',
        inputs: {
          user_turn: userTurn,
          assistant_turn: assistantTurn,
        },
      };

      const options: any = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      };

      const response = await fetch('https://chat.dev.genies.com/v1/llm/infer', options);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LLM Gateway request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();

      // Extract the response from the API
      // The API returns { data: { response: "..." } }
      // The response should be a string with 4 follow-up options
      // We'll parse it and return as an array
      const followUpsText = data?.data?.response || '';
      
      // Parse the response - it might be a single string with 4 options
      // Try to split by newlines or common separators
      // If it's already formatted, return as array; otherwise split intelligently
      let followups: string[] = [];
      
      if (typeof followUpsText === 'string') {
        // Try splitting by newlines first
        followups = followUpsText
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .filter(line => {
            // Remove common list markers (1., 2., -, *, etc.)
            return !/^[\d\-\*\.\)]\s*$/.test(line);
          })
          .map(line => {
            // Remove leading numbers, dashes, or bullets
            return line.replace(/^[\d\-\*\.\)]\s+/, '').trim();
          });
        
        // If we got less than 4, try splitting by other patterns
        if (followups.length < 4) {
          // Try splitting by common separators
          const alternatives = followUpsText.split(/[|;]/).map(s => s.trim()).filter(s => s.length > 0);
          if (alternatives.length >= followups.length) {
            followups = alternatives;
          }
        }
        
        // Ensure we have exactly 4 options (pad or truncate if needed)
        if (followups.length > 4) {
          followups = followups.slice(0, 4);
        } else if (followups.length < 4 && followups.length > 0) {
          // If we have fewer than 4, the API might return them differently
          // Just return what we have
        }
      }

      return followups.length > 0 ? followups : [followUpsText];
    } catch (error) {
      console.error('[getFollowUps]:', error);
      throw error;
    }
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
