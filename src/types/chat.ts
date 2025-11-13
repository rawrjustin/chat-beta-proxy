// Request types
export interface ChatRequest {
  config_id: string;
  input: string;
  session_id: string;
  idempotency_key?: string;
  images?: {
    bucket: string;
    object_key: string;
  }[];
  parameters?: Record<string, string>;
  enable_animation?: boolean;
  metadata_info?: Record<string, any>;
  message_source?: string;
  need_voice?: boolean;
  need_facemotion?: boolean;
}

export interface CreateSessionRequest {
  config_id: string;
}

// Response types
export interface ChatResponse {
  ai: string;
  events?: any[];
  idempotency_key?: string;
  list_sent?: string[];
  session: {
    id: string;
    status: string;
  };
  request_id?: string;
  audio_code?: string;
  timestamp?: Record<string, {
    start: number;
    end: number;
  }>;
  tags?: {
    tag_type: string;
    content: string;
    start_time: number;
    original_index: number;
  }[];
  blendshape_values?: number[][];
  character_mapping?: Record<string, string>;
  text_response_cleaned?: string;
  voice_pipeline_latency?: number;
  total_latency?: number;
  warning_message?: string;
}

export type PrepromptType = 'roleplay' | 'conversation';

export interface Preprompt {
  type: PrepromptType;
  prompt: string;
  simplified_text: string;
}

export interface PrepromptPayload {
  preprompts: Preprompt[];
}

export interface CreateSessionResponse {
  session_id: string;
  config_id: string;
  user_id: string;
  session_status: string;
  updated_at: number;
}

export interface ConfigResponse {
  // The config structure can be defined based on actual response
  [key: string]: any;
}

export interface CharacterInfo {
  config_id: string;
  name?: string;
  description?: string;
  avatar_url?: string;
  [key: string]: any;
}

export interface CharactersListResponse {
  characters: CharacterInfo[];
  total?: number;
}

export interface GetConfigsRequest {
  config_ids: string[];
}

// Proxy API request/response types (simplified for frontend)
export interface ProxyChatRequest {
  session_id: string;
  input: string;
  config_id: string;
  conversation_history?: ConversationMessage[]; // Optional: Up to 8 messages (4 pairs) for better preprompts
}

export interface ProxyChatResponse {
  ai: string;
  session_id: string;
  request_id?: string;
  text_response_cleaned?: string;
  warning_message?: string;
  preprompts?: Preprompt[];
}

// Follow-ups API types
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface FollowUpsRequest {
  // Either conversation_history OR user_turn + assistant_turn should be provided
  conversation_history?: ConversationMessage[]; // Up to 8 messages (4 pairs total)
  user_turn?: string; // Deprecated: use conversation_history instead
  assistant_turn?: string; // Deprecated: use conversation_history instead
  config_id?: string;
}

export interface FollowUpsResponse {
  preprompts: Preprompt[];
}
