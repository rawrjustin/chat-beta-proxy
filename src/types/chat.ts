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

export interface CreateSessionResponse {
  id: string;
  status: string;
  config_id: string;
}

export interface ConfigResponse {
  // The config structure can be defined based on actual response
  [key: string]: any;
}

// Proxy API request/response types (simplified for frontend)
export interface ProxyChatRequest {
  session_id: string;
  input: string;
  config_id: string;
}

export interface ProxyChatResponse {
  ai: string;
  session_id: string;
  request_id?: string;
  text_response_cleaned?: string;
  warning_message?: string;
}
