import mixpanel from 'mixpanel';

const MIXPANEL_TOKEN = process.env.MIXPANEL_TOKEN || '310df1477e567a825114d2ab16395ddc';

// Initialize Mixpanel client
let mixpanelClient: mixpanel.Mixpanel | null = null;

/**
 * Initialize Mixpanel client
 */
export function initMixpanel(): void {
  try {
    mixpanelClient = mixpanel.init(MIXPANEL_TOKEN, {
      host: 'api.mixpanel.com',
    });
    console.log('✅ Mixpanel initialized');
  } catch (error) {
    console.error('⚠️  Failed to initialize Mixpanel:', error);
  }
}

/**
 * Get Mixpanel client instance
 */
function getMixpanelClient(): mixpanel.Mixpanel {
  if (!mixpanelClient) {
    throw new Error('Mixpanel not initialized. Call initMixpanel() first.');
  }
  return mixpanelClient;
}

/**
 * Identify a user by their session_id and set user properties
 */
export function identifyUser(sessionId: string): void {
  try {
    const client = getMixpanelClient();
    // Set user properties using people.set() with distinct_id
    client.people.set(sessionId, {
      session_id: sessionId,
    });
  } catch (error) {
    console.error('Failed to identify user in Mixpanel:', error);
  }
}

/**
 * Track a "Chat Sent" event
 */
export function trackChatSent(properties: {
  session_id: string;
  config_id: string;
  input_length: number;
  has_conversation_history?: boolean;
  conversation_history_length?: number;
}): void {
  try {
    const client = getMixpanelClient();
    
    // Identify user by session_id (sets user properties)
    identifyUser(properties.session_id);
    
    // Track the event with the session_id as the distinct_id
    // Include distinct_id in properties to identify the user
    client.track('Chat Sent', {
      distinct_id: properties.session_id,
      session_id: properties.session_id,
      config_id: properties.config_id,
      input_length: properties.input_length,
      has_conversation_history: properties.has_conversation_history || false,
      conversation_history_length: properties.conversation_history_length || 0,
    });
  } catch (error) {
    console.error('Failed to track Chat Sent event in Mixpanel:', error);
  }
}

