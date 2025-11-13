# Chat Proxy API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:3000` (development)  
**Content-Type:** `application/json`

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Get Character Config](#get-character-config)
  - [Create Chat Session](#create-chat-session)
  - [Send Chat Message](#send-chat-message)
  - [Get Initial Message](#get-initial-message)
  - [Generate Follow-up Options](#generate-follow-up-options)
- [Request/Response Examples](#requestresponse-examples)
- [Error Handling](#error-handling)
- [TypeScript Types](#typescript-types)
- [Frontend Integration Guide](#frontend-integration-guide)
- [Best Practices](#best-practices)

---

## Overview

The Chat Proxy API is a backend service that provides a simplified interface for interacting with Genies chat AI. It handles authentication, session management, and provides a clean API for frontend applications.

### Key Features

- ✅ **Session-based chat** - Maintain conversation context across messages
- ✅ **Automatic token refresh** - Tokens are refreshed automatically in the background
- ✅ **CORS enabled** - Ready for frontend integration
- ✅ **Error handling** - Comprehensive error responses
- ✅ **TypeScript support** - Full type definitions available

---

## Authentication

The API uses Bearer token authentication handled automatically by the backend. No authentication headers are required from the frontend - all authentication is managed server-side.

**Note:** The backend automatically refreshes tokens when they expire, so frontend applications don't need to handle token refresh logic.

---

## Endpoints

### Health Check

Check if the server is running and healthy.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-05T02:50:16.728Z"
}
```

**Example:**
```javascript
const response = await fetch('http://localhost:3000/health');
const data = await response.json();
console.log(data.status); // "ok"
```

---

### Get Available Characters

Get a list of all available characters that the frontend can display to users. The backend defines which characters are available.

**Endpoint:** `GET /api/characters`

**Response:**
```json
{
  "characters": [
    {
      "config_id": "CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4",
      "name": "Woody",
      "description": "Sheriff Woody Pride",
      "display_order": 1,
      "config": {
        // Full character configuration from API
      }
    }
  ],
  "total": 1
}
```

**Response Fields:**
- `characters` (array) - Array of available characters with their configs
  - `config_id` (string) - Character configuration ID
  - `name` (string, optional) - Display name for the character
  - `description` (string, optional) - Character description
  - `display_order` (number, optional) - Order for displaying characters
  - `config` (object) - Full character configuration object
- `total` (number) - Total number of available characters

**Example:**
```javascript
const response = await fetch('http://localhost:3000/api/characters');
const data = await response.json();

// Display characters to users
data.characters.forEach(character => {
  console.log(`${character.name} (${character.config_id})`);
});
```

**Error Responses:**
- `500` - Server error

**Notes:**
- Characters are sorted by `display_order` (if provided)
- The backend defines which characters are available in `src/config/characters.ts`
- You can also set `AVAILABLE_CHARACTERS` environment variable (comma-separated IDs)

---

### Get Character Config

Retrieve the configuration for a specific character.

**Endpoint:** `GET /api/config/:configId`

**URL Parameters:**
- `configId` (string, required) - The character configuration ID (e.g., `CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4`)

**Response:**
```json
{
  // Character configuration object
  // Structure varies by character
}
```

**Example:**
```javascript
const configId = 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4';
const response = await fetch(`http://localhost:3000/api/config/${configId}`);
const config = await response.json();
```

**Error Responses:**
- `400` - Config ID is required
- `404` - Character config not found
- `500` - Server error

---

### Get Multiple Character Configs

Retrieve configurations for multiple characters at once. This is useful for displaying a list of available characters to users.

**Endpoint:** `POST /api/configs`

**Request Body:**
```typescript
{
  config_ids: string[];  // Required: Array of character configuration IDs (max 50)
}
```

**Response:**
```json
{
  "configs": {
    "CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4": {
      // Character configuration object
    },
    "CHAR_another-id-here": {
      // Another character configuration
    }
  },
  "requested": 2,
  "retrieved": 2
}
```

**Response Fields:**
- `configs` (object) - Map of config_id to character configuration
- `requested` (number) - Number of config IDs requested
- `retrieved` (number) - Number of configs successfully retrieved

**Example:**
```javascript
const response = await fetch('http://localhost:3000/api/configs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    config_ids: [
      'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4',
      'CHAR_another-character-id'
    ]
  })
});

const data = await response.json();
console.log('Retrieved configs:', Object.keys(data.configs));
console.log('Config details:', data.configs);
```

**Error Responses:**
- `400` - Invalid request (missing or empty config_ids array, or more than 50 IDs)
- `500` - Server error

**Notes:**
- Configs are fetched in parallel for better performance
- If a config ID doesn't exist, it will be omitted from the response (not cause an error)
- Maximum 50 config IDs per request to prevent abuse

---

### Create Chat Session

Create a new chat session for a conversation with a character.

**Endpoint:** `POST /api/sessions`

**Request Body:**
```typescript
{
  config_id: string;  // Required: Character configuration ID
}
```

**Response:**
```json
{
  "session_id": "c62ca618-ddef-43bf-a8e4-d6268c17f965",
  "config_id": "CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4",
  "user_id": "8cae102a-1c31-4016-9ec0-cf69aabc2cc1",
  "session_status": "active",
  "updated_at": 1762311017
}
```

**Response Fields:**
- `session_id` (string) - Unique session identifier. **Save this for the conversation.**
- `config_id` (string) - Character configuration ID
- `user_id` (string) - User identifier
- `session_status` (string) - Session status (e.g., "active")
- `updated_at` (number) - Unix timestamp of last update

**Example:**
```javascript
const response = await fetch('http://localhost:3000/api/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    config_id: 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4'
  })
});

const session = await response.json();
const sessionId = session.session_id;
// Save sessionId for subsequent messages
```

**Error Responses:**
- `400` - `config_id` is required
- `500` - Failed to create session

**Best Practice:** Create a session once per conversation. Use the same `session_id` for all messages in that conversation.

---

### Send Chat Message

Send a message to the chat AI and receive a response. The endpoint automatically generates contextual follow-up prompts based on the conversation history.

**Endpoint:** `POST /api/chat`

**Request Body:**
```typescript
{
  session_id: string;  // Required: Session ID from /api/sessions (can be empty string to create new session)
  config_id: string;   // Required: Character configuration ID
  input: string;       // Required: User's message text
  conversation_history?: Array<{  // Optional: Up to 8 messages (4 pairs) for better preprompts
    role: 'user' | 'assistant';
    content: string;
  }>;
}
```

**Response:**
```json
{
  "ai": "Well, howdy there, partner! I'm doin' just fine...",
  "session_id": "c62ca618-ddef-43bf-a8e4-d6268c17f965",
  "request_id": "gewjhZ045tUIhZTRoUK85",
  "text_response_cleaned": "Well, howdy there, partner! I'm doing just fine...",
  "warning_message": null,
  "preprompts": [
    {
      "type": "roleplay",
      "prompt": "Full prompt text to send when clicked",
      "simplified_text": "Short text for UI"
    }
    // ... 3 more preprompts
  ]
}
```

**Response Fields:**
- `ai` (string) - The AI's response text
- `session_id` (string) - Session identifier (returned even if empty string was sent)
- `request_id` (string, optional) - Unique identifier for this request
- `text_response_cleaned` (string, optional) - Cleaned version of the AI response
- `warning_message` (string, optional) - Any warning messages
- `preprompts` (array, optional) - 4 contextual follow-up prompts (automatically generated)

**Example - Basic Usage:**
```javascript
const response = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: 'c62ca618-ddef-43bf-a8e4-d6268c17f965',
    config_id: 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4',
    input: 'Hello! How are you doing today?'
  })
});

const chatResponse = await response.json();
console.log('AI:', chatResponse.ai);
console.log('Session:', chatResponse.session_id);
console.log('Follow-ups:', chatResponse.preprompts); // Automatically generated
```

**Example - With Conversation History (Recommended for Better Context):**
```javascript
// Get last 4 pairs of messages from your chat history
const recentMessages = [
  { role: 'user', content: 'What do you think about AI?' },
  { role: 'assistant', content: 'I think AI is fascinating! What interests you?' },
  { role: 'user', content: 'I want to build something cool.' },
  { role: 'assistant', content: 'That sounds exciting! What kind of project?' },
  { role: 'user', content: 'Maybe a chatbot?' },
  { role: 'assistant', content: 'Great idea! Chatbots can be really engaging.' },
  { role: 'user', content: 'How do I get started?' },
  { role: 'assistant', content: 'Start with a simple use case and build from there!' }
];

const response = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: 'c62ca618-ddef-43bf-a8e4-d6268c17f965',
    config_id: 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4',
    input: 'Can you help me design the conversation flow?',
    conversation_history: recentMessages.slice(-8) // Last 8 messages (4 pairs)
  })
});

const chatResponse = await response.json();
// chatResponse.preprompts will be more contextual based on full conversation history
```

**Special Case: Empty Session ID**

If you send an empty string `""` for `session_id`, the API will automatically create a new session:

```javascript
const response = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: '',  // Empty string creates new session
    config_id: 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4',
    input: 'Hello!'
  })
});

const chatResponse = await response.json();
// chatResponse.session_id will contain the new session ID
```

**Error Responses:**
- `400` - Invalid request:
  - Missing required fields: `session_id`, `input`, or `config_id`
  - `"conversation_history must be an array"`
  - `"conversation_history can contain at most 8 messages (4 pairs total)"`
  - `"conversation_history[0].role must be either 'user' or 'assistant'"`
  - `"conversation_history[0].content must be a string"`
- `500` - Failed to send chat message

**Notes:**
- **Preprompts are automatically generated** and included in the response
- If `conversation_history` is provided, preprompts will be more contextual based on the full conversation
- If `conversation_history` is not provided, preprompts are generated from just the current message pair
- The endpoint automatically appends the current exchange to the conversation history before generating preprompts

---

### Get Initial Message

Get the character's initial greeting message when entering a chat room. This endpoint automatically sends an invisible greeting message to the character and returns their response. Use this when a user first enters a chat to show the character's opening message.

**Endpoint:** `POST /api/initial-message`

**Request Body:**
```typescript
{
  session_id: string;  // Required: Session ID (can be existing or newly created)
  config_id: string;   // Required: Character configuration ID
  conversation_history?: Array<{  // Optional: Previous conversation messages (recommended format)
    role: 'user' | 'assistant';
    content: string;
  }>;
  previous_messages?: Array<{  // Optional: Legacy format (use conversation_history instead)
    role: 'user' | 'ai';
    content: string;
  }>;
}
```

**Behavior:**
- **New Chat** (no `conversation_history`/`previous_messages` or empty array): Sends "I just walked in on you, greet me and tell me your current scenario"
- **Returning User** (with `conversation_history` or `previous_messages`): Sends a message acknowledging the user's return and includes the conversation history

**Note:** Use `conversation_history` (with `role: 'user' | 'assistant'`) instead of `previous_messages` (with `role: 'user' | 'ai'`) for consistency with other endpoints.

**Response:**
```json
{
  "ai": "Hey there! Welcome to my world...",
  "session_id": "c62ca618-ddef-43bf-a8e4-d6268c17f965",
  "request_id": "gewjhZ045tUIhZTRoUK85",
  "text_response_cleaned": "Hey there! Welcome to my world...",
  "warning_message": null,
  "preprompts": [
    {
      "type": "roleplay",
      "prompt": "...",
      "simplified_text": "..."
    }
  ]
}
```

**Response Fields:**
- `ai` (string) - The character's greeting response text
- `session_id` (string) - Session identifier
- `request_id` (string, optional) - Unique identifier for this request
- `text_response_cleaned` (string, optional) - Cleaned version of the response
- `warning_message` (string, optional) - Any warning messages
- `preprompts` (array, optional) - Suggested follow-up prompts

**Example - New Chat:**
```javascript
// When user enters a new chat room (no previous messages)
const response = await fetch('http://localhost:3000/api/initial-message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: 'c62ca618-ddef-43bf-a8e4-d6268c17f965',
    config_id: 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4'
    // No conversation_history - this is a new chat
  })
});

const initialMessage = await response.json();
// Display initialMessage.ai as the first message in the chat
// Show initialMessage.preprompts as follow-up options
// Show loading spinner while waiting for this response
```

**Example - Returning User (Recommended Format):**
```javascript
// When user returns to an existing chat (has previous messages)
const conversationHistory = [
  { role: 'user', content: 'Hello, how are you?' },
  { role: 'assistant', content: 'I\'m doing great! How about you?' },
  { role: 'user', content: 'I\'m good too, thanks!' },
  { role: 'assistant', content: 'That\'s wonderful to hear!' }
];

const response = await fetch('http://localhost:3000/api/initial-message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: 'c62ca618-ddef-43bf-a8e4-d6268c17f965',
    config_id: 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4',
    conversation_history: conversationHistory.slice(-8) // Last 8 messages (4 pairs)
  })
});

const initialMessage = await response.json();
// Display initialMessage.ai as the greeting message acknowledging the return
// Display initialMessage.preprompts as follow-up options (contextual based on history)
// Show loading spinner while waiting for this response
```

**Example - Legacy Format (Still Supported):**
```javascript
// Legacy format using previous_messages (still works but not recommended)
const previousMessages = [
  { role: 'user', content: 'Hello, how are you?' },
  { role: 'ai', content: 'I\'m doing great! How about you?' }
];

const response = await fetch('http://localhost:3000/api/initial-message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: 'c62ca618-ddef-43bf-a8e4-d6268c17f965',
    config_id: 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4',
    previous_messages: previousMessages  // Legacy format
  })
});
```

**Note:** 
- For **new chats**, this endpoint sends an invisible message ("I just walked in on you, greet me and tell me your current scenario") to the character.
- For **returning users**, it sends a message acknowledging their return and includes the conversation history.
- The user never sees these invisible messages - only the character's response is returned and should be displayed.

**Error Responses:**
- `400` - Invalid request:
  - Missing required fields: `session_id` or `config_id`
  - `"conversation_history must be an array"`
  - `"conversation_history can contain at most 8 messages (4 pairs total)"`
  - `"conversation_history[0].role must be either 'user' or 'assistant'"`
  - `"conversation_history[0].content must be a string"`
- `500` - Failed to get initial message

**Notes:**
- **Preprompts are automatically generated** and included in the response
- If `conversation_history` is provided, preprompts will be more contextual based on the full conversation
- Use `conversation_history` format (`role: 'user' | 'assistant'`) instead of `previous_messages` (`role: 'user' | 'ai'`) for consistency

---

### Generate Follow-up Options

Generate contextual follow-up prompts based on recent conversation history. This endpoint uses AI to generate 4 suggested prompts (2 roleplay, 2 conversational) that users can click to continue the conversation.

**Endpoint:** `POST /api/followups`

**Request Body:**
```typescript
{
  conversation_history?: Array<{  // Recommended: Up to 8 messages (4 pairs)
    role: 'user' | 'assistant';
    content: string;
  }>;
  user_turn?: string;              // Legacy: Use conversation_history instead
  assistant_turn?: string;         // Legacy: Use conversation_history instead
  config_id?: string;              // Optional: Character config ID
}
```

**Request Format Options:**

**Option 1: Using `conversation_history` (Recommended)**
```json
{
  "conversation_history": [
    {
      "role": "user",
      "content": "I slam my fist on the table, rattling the protein shaker. \"Forget warming up, bro! We're going straight into the abyss. You wanna talk about the primal urge to dominate or just rip some fucking weight?\""
    },
    {
      "role": "assistant",
      "content": "HA! THAT'S WHAT I'M TALKIN' ABOUT! Straight chaos energy! Alright, abyss mode it is—rack's waiting, bar's cold, souls are trembling. You wanna call first lift or should I unleash the opening set of destiny?"
    },
    {
      "role": "user",
      "content": "I grab the heaviest dumbbell I can find, hefting it with a grunt. \"Let's start with something that'll make my balls retract. Drop set on these fuckers until I can't feel my arms.\""
    },
    {
      "role": "assistant",
      "content": "YES SIR! THAT'S THE SPIRIT OF THE IRON CHURCH! Alright, drop set protocol: clean form, no chicken wings, breathe like you're powering a jet engine. I'll count the reps, you chase the burn. You goin' full drop or you want me to spot halfway?"
    }
  ],
  "config_id": "CHAR_dbafb670-8b2b-4d58-ac81-2b2f4058f44e"
}
```

**Option 2: Legacy Format (Still Supported)**
```json
{
  "user_turn": "Hello, how are you?",
  "assistant_turn": "I'm doing great, thanks for asking! How can I help you today?",
  "config_id": "CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4"
}
```

**Response:**
```json
{
  "preprompts": [
    {
      "type": "roleplay",
      "prompt": "You lean in with a grin, daring them to dish the weirdest fact about their day.",
      "simplified_text": "spill the weird"
    },
    {
      "type": "roleplay",
      "prompt": "You clap once, ready for action, and tell them you're about to throw a curveball of a request.",
      "simplified_text": "hit me wild"
    },
    {
      "type": "conversation",
      "prompt": "Okay, now I'm curious—what do you actually love helping people with the most?",
      "simplified_text": "what's your thing?"
    },
    {
      "type": "conversation",
      "prompt": "Hold on, so what happens if I just keep asking you for spicier story ideas?",
      "simplified_text": "spicier ideas?"
    }
  ]
}
```

**Response Fields:**
- `preprompts` (array) - Array of 4 suggested follow-up prompts
  - `type` (string) - Either `"roleplay"` or `"conversation"`
    - First 2 are always `"roleplay"` (action-driven)
    - Last 2 are always `"conversation"` (curiosity-driven)
  - `prompt` (string) - Full prompt text (1-2 sentences) to send to the character
  - `simplified_text` (string) - Short version (≤10 words) for display in UI

**Validation Rules:**
- `conversation_history` must be an array
- Maximum 8 messages (4 pairs of user/assistant)
- Each message must have:
  - `role`: Either `"user"` or `"assistant"`
  - `content`: String with the message text
- Either `conversation_history` OR (`user_turn` + `assistant_turn`) must be provided

**Example - Using Conversation History:**
```javascript
// Get the last 4 pairs of messages from your chat history
const recentMessages = [
  { role: 'user', content: 'What do you think about AI?' },
  { role: 'assistant', content: 'I think AI is fascinating! What interests you?' },
  { role: 'user', content: 'I want to build something cool.' },
  { role: 'assistant', content: 'That sounds exciting! What kind of project?' },
  { role: 'user', content: 'Maybe a chatbot?' },
  { role: 'assistant', content: 'Great idea! Chatbots can be really engaging.' },
  { role: 'user', content: 'How do I get started?' },
  { role: 'assistant', content: 'Start with a simple use case and build from there!' }
];

const response = await fetch('http://localhost:3000/api/followups', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    conversation_history: recentMessages.slice(-8), // Last 8 messages (4 pairs)
    config_id: 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4'
  })
});

const data = await response.json();

// Display preprompts to user
data.preprompts.forEach((preprompt, index) => {
  console.log(`${index + 1}. [${preprompt.type}] ${preprompt.simplified_text}`);
  // Use preprompt.prompt when user clicks to send the full prompt
});
```

**Example - React Hook:**
```tsx
import { useState, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Preprompt {
  type: 'roleplay' | 'conversation';
  prompt: string;
  simplified_text: string;
}

export function useFollowUps(configId: string) {
  const [preprompts, setPreprompts] = useState<Preprompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateFollowUps = useCallback(async (messages: Message[]) => {
    setIsLoading(true);
    try {
      // Get last 8 messages (4 pairs) if available
      const recentMessages = messages.slice(-8);
      
      const response = await fetch('http://localhost:3000/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_history: recentMessages,
          config_id: configId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate follow-ups');
      }

      const data = await response.json();
      setPreprompts(data.preprompts);
    } catch (error) {
      console.error('Error generating follow-ups:', error);
      setPreprompts([]);
    } finally {
      setIsLoading(false);
    }
  }, [configId]);

  return { preprompts, isLoading, generateFollowUps };
}

// Usage in component
function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { preprompts, isLoading, generateFollowUps } = useFollowUps('CHAR_...');

  // After receiving AI response, generate follow-ups
  const handleAIResponse = async (aiMessage: string) => {
    setMessages(prev => [...prev, { role: 'assistant', content: aiMessage }]);
    
    // Generate follow-ups with updated message history
    const updatedMessages = [...messages, { role: 'assistant', content: aiMessage }];
    await generateFollowUps(updatedMessages);
  };

  return (
    <div>
      {/* Chat messages */}
      {messages.map((msg, i) => (
        <div key={i}>{msg.content}</div>
      ))}
      
      {/* Follow-up prompts */}
      {preprompts.length > 0 && (
        <div className="follow-ups">
          {preprompts.map((p, i) => (
            <button
              key={i}
              onClick={() => sendMessage(p.prompt)} // Use full prompt
              className={`preprompt ${p.type}`}
            >
              {p.simplified_text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Example - Getting Last 4 Pairs from Chat History:**
```javascript
// Helper function to extract last 4 pairs from chat messages
function getLastFourPairs(messages) {
  // Filter to get only user and assistant messages
  const validMessages = messages.filter(msg => 
    msg.role === 'user' || msg.role === 'assistant'
  );
  
  // Get last 8 messages (4 pairs)
  return validMessages.slice(-8);
}

// Usage
const chatHistory = [
  { role: 'user', content: 'Hello' },
  { role: 'assistant', content: 'Hi there!' },
  { role: 'user', content: 'How are you?' },
  { role: 'assistant', content: 'I'm great!' },
  { role: 'user', content: 'Tell me a joke' },
  { role: 'assistant', content: 'Why did the chicken cross the road?' },
  { role: 'user', content: 'I don't know' },
  { role: 'assistant', content: 'To get to the other side!' }
];

const lastFourPairs = getLastFourPairs(chatHistory);
// Returns last 8 messages (4 pairs)

// Send to API
const response = await fetch('http://localhost:3000/api/followups', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    conversation_history: lastFourPairs,
    config_id: 'CHAR_...'
  })
});
```

**Error Responses:**
- `400` - Invalid request:
  - `"conversation_history must be an array"`
  - `"conversation_history can contain at most 8 messages (4 pairs total)"`
  - `"conversation_history[0].role must be either 'user' or 'assistant'"`
  - `"conversation_history[0].content must be a string"`
  - `"Either conversation_history (up to 8 messages) or user_turn + assistant_turn must be provided"`
- `500` - Failed to generate follow-ups

**Best Practices:**
1. **Use `conversation_history`** - The new format provides better context for generating relevant follow-ups
2. **Send last 4 pairs** - Include the most recent 8 messages (4 user + 4 assistant) when available
3. **Handle empty history** - If you have fewer than 8 messages, send what you have
4. **Display `simplified_text`** - Show the short version in the UI, but send `prompt` when clicked
5. **Update after each message** - Regenerate follow-ups after each AI response to keep them contextual
6. **Show loading state** - Display a loading indicator while generating follow-ups

**Notes:**
- The API automatically limits to 8 messages (4 pairs) - if you send more, you'll get a 400 error
- Messages should alternate between user and assistant, but the API doesn't enforce strict alternation
- The `config_id` is optional but recommended for character-specific prompt generation
- Legacy format (`user_turn` + `assistant_turn`) is still supported for backward compatibility

---

## Request/Response Examples

### Complete Chat Flow

```javascript
// Step 1: Create a session (once per conversation)
const createSession = async (configId) => {
  const response = await fetch('http://localhost:3000/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config_id: configId })
  });
  const session = await response.json();
  return session.session_id;
};

// Step 2: Send messages using the session
const sendMessage = async (sessionId, configId, userMessage) => {
  const response = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      config_id: configId,
      input: userMessage
    })
  });
  const chatResponse = await response.json();
  return chatResponse;
};

// Usage
const configId = 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4';
const sessionId = await createSession(configId);

// First message
const response1 = await sendMessage(sessionId, configId, 'Hello!');
console.log('AI:', response1.ai);

// Follow-up message (same session)
const response2 = await sendMessage(sessionId, configId, 'Tell me more!');
console.log('AI:', response2.ai);
```

### Simplified Flow (No Session Creation)

You can skip session creation and let the chat endpoint create sessions automatically:

```javascript
const sendMessage = async (configId, userMessage, sessionId = '') => {
  const response = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,  // Empty string for first message
      config_id: configId,
      input: userMessage
    })
  });
  const chatResponse = await response.json();
  return chatResponse;
};

// Usage
const configId = 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4';
let sessionId = '';

// First message (creates session)
const response1 = await sendMessage(configId, 'Hello!', sessionId);
sessionId = response1.session_id;  // Save session ID

// Subsequent messages (use saved session ID)
const response2 = await sendMessage(configId, 'Tell me more!', sessionId);
```

---

## Error Handling

### Error Response Format

All errors follow this structure:

```json
{
  "error": "Error message",
  "message": "Detailed error message or stack trace"
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (missing or invalid parameters)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

### Error Handling Example

```javascript
async function sendChatMessage(sessionId, configId, input) {
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        config_id: configId,
        input: input
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Chat error:', error.message);
    // Handle error appropriately
    throw error;
  }
}
```

---

## TypeScript Types

### Request Types

```typescript
interface CreateSessionRequest {
  config_id: string;
}

interface ProxyChatRequest {
  session_id: string;  // Can be empty string
  input: string;
  config_id: string;
  conversation_history?: ConversationMessage[]; // Optional: Up to 8 messages (4 pairs) for better preprompts
}

interface GetConfigsRequest {
  config_ids: string[];  // Array of character config IDs (max 50)
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface FollowUpsRequest {
  conversation_history?: ConversationMessage[]; // Up to 8 messages (4 pairs total)
  user_turn?: string;                         // Legacy: Use conversation_history instead
  assistant_turn?: string;                     // Legacy: Use conversation_history instead
  config_id?: string;                          // Optional: Character config ID
}
```

### Response Types

```typescript
interface HealthResponse {
  status: string;
  timestamp: string;
}

interface CreateSessionResponse {
  session_id: string;
  config_id: string;
  user_id: string;
  session_status: string;
  updated_at: number;
}

interface ChatResponse {
  ai: string;
  session_id: string;
  request_id?: string;
  text_response_cleaned?: string;
  warning_message?: string | null;
}

interface GetConfigsResponse {
  configs: Record<string, any>;  // Map of config_id to character config
  requested: number;
  retrieved: number;
}

interface CharacterResponse {
  config_id: string;
  name?: string;
  description?: string;
  display_order?: number;
  config: any;  // Full character configuration
}

interface CharactersResponse {
  characters: CharacterResponse[];
  total: number;
}

interface Preprompt {
  type: 'roleplay' | 'conversation';
  prompt: string;
  simplified_text: string;
}

interface FollowUpsResponse {
  preprompts: Preprompt[];
}

interface ErrorResponse {
  error: string;
  message?: string;
}
```

---

## Frontend Integration Guide

### Fetching Available Characters Example

```tsx
import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:3000';

// Hook to fetch available characters from backend
export function useAvailableCharacters() {
  const [characters, setCharacters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/characters`);

      if (!response.ok) {
        throw new Error('Failed to fetch available characters');
      }

      const data = await response.json();
      setCharacters(data.characters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  return { characters, isLoading, error, refetch: fetchCharacters };
}

// Usage in component
function CharacterSelector() {
  const { characters, isLoading, error } = useAvailableCharacters();

  if (isLoading) return <div>Loading characters...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="character-selector">
      <h2>Available Characters</h2>
      {characters.map((character) => (
        <div key={character.config_id} className="character-card">
          <h3>{character.name || character.config_id}</h3>
          {character.description && <p>{character.description}</p>}
          <button onClick={() => startChat(character.config_id)}>
            Chat with {character.name || 'Character'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

### React Example

```tsx
import { useState, useCallback } from 'react';

const API_BASE = 'http://localhost:3000';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export function useChat(configId: string) {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (userInput: string) => {
    setIsLoading(true);
    
    try {
      // Add user message to UI
      setMessages(prev => [...prev, { role: 'user', content: userInput }]);

      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId || '',
          config_id: configId,
          input: userInput
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Update session ID if we didn't have one
      if (!sessionId && data.session_id) {
        setSessionId(data.session_id);
      }

      // Add AI response to UI
      setMessages(prev => [...prev, { role: 'ai', content: data.ai }]);
      
      return data;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, configId]);

  const startNewConversation = useCallback(() => {
    setSessionId('');
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    startNewConversation
  };
}
```

### Usage in Component

```tsx
function ChatComponent() {
  const configId = 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4';
  const { messages, isLoading, sendMessage, startNewConversation } = useChat(configId);
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    await sendMessage(input);
    setInput('');
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
      
      <button onClick={startNewConversation}>New Conversation</button>
    </div>
  );
}
```

### Vanilla JavaScript Example

```javascript
class ChatClient {
  constructor(baseUrl, configId) {
    this.baseUrl = baseUrl;
    this.configId = configId;
    this.sessionId = '';
  }

  async sendMessage(input) {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: this.sessionId || '',
        config_id: this.configId,
        input: input
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    const data = await response.json();
    
    // Update session ID
    if (data.session_id) {
      this.sessionId = data.session_id;
    }

    return data;
  }

  startNewConversation() {
    this.sessionId = '';
  }
}

// Usage
const chat = new ChatClient('http://localhost:3000', 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4');

document.getElementById('send-button').addEventListener('click', async () => {
  const input = document.getElementById('message-input').value;
  const response = await chat.sendMessage(input);
  console.log('AI:', response.ai);
});
```

---

## Best Practices

### 1. Session Management

- **Create a session once per conversation** - Use `/api/sessions` to create a session, then reuse the `session_id` for all messages in that conversation
- **Or use empty session ID** - You can skip session creation and use an empty string `""` for `session_id` in the first message. The API will create a session automatically.
- **Store session IDs** - Save the `session_id` from responses to maintain conversation context
- **New conversation = new session** - Start a new session for each new conversation

### 2. Error Handling

- Always check `response.ok` before parsing JSON
- Handle network errors separately from API errors
- Display user-friendly error messages
- Consider retry logic for network failures

### 3. Loading States

- Show loading indicators while waiting for AI responses
- Disable input during message sending
- Consider implementing message queueing if users send multiple messages quickly

### 4. User Experience

- Display messages as they're sent (optimistic UI)
- Show AI responses as they're received
- Handle long response times gracefully
- Provide clear feedback for errors

### 5. Performance

- Cache character configs if needed
- Consider debouncing rapid message sends
- Implement proper cleanup for session management

### 6. Security

- Never expose API tokens in frontend code
- Validate user input before sending
- Sanitize messages if displaying HTML
- Use HTTPS in production

---

## Character Configuration

### Default Character

The default character ID used in examples:
```
CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4
```

### Getting Character Configs

To get available character configurations:

```javascript
const configId = 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4';
const response = await fetch(`http://localhost:3000/api/config/${configId}`);
const config = await response.json();
```

---

## CORS Configuration

The API has CORS enabled for all origins by default. This means you can make requests from any frontend application without CORS issues.

**Note:** For production, you may want to restrict CORS to specific origins. This is configured server-side.

---

## Rate Limiting

Currently, there is no rate limiting implemented. Consider implementing client-side rate limiting or request throttling for production use.

---

## Troubleshooting

### Common Issues

**1. "session_id (can be empty), input, and config_id are required"**
- Ensure all three fields are present in the request body
- `session_id` can be an empty string `""` but must be present

**2. "Failed to create session"**
- Check that `config_id` is valid
- Verify server is running and accessible

**3. Network Errors**
- Verify the server is running on `http://localhost:3000`
- Check CORS settings if calling from a browser
- Ensure the base URL is correct

**4. 401 Unauthorized**
- The backend handles authentication automatically
- If you see 401 errors, the token may need to be refreshed (backend handles this)
- Check server logs for authentication issues

---

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify all required fields are present in requests
3. Test with the health endpoint first
4. Review the error response body for specific error messages

---

## Changelog

### Version 1.0.0
- Initial API release
- Session management
- Chat messaging
- Automatic token refresh
- Health check endpoint

---

**Last Updated:** November 5, 2025  
**API Version:** 1.0.0

