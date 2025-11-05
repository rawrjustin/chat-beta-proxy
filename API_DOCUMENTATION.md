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

Send a message to the chat AI and receive a response.

**Endpoint:** `POST /api/chat`

**Request Body:**
```typescript
{
  session_id: string;  // Required: Session ID from /api/sessions (can be empty string to create new session)
  config_id: string;   // Required: Character configuration ID
  input: string;       // Required: User's message text
}
```

**Response:**
```json
{
  "ai": "Well, howdy there, partner! I'm doin' just fine...",
  "session_id": "c62ca618-ddef-43bf-a8e4-d6268c17f965",
  "request_id": "gewjhZ045tUIhZTRoUK85",
  "text_response_cleaned": "Well, howdy there, partner! I'm doing just fine...",
  "warning_message": null
}
```

**Response Fields:**
- `ai` (string) - The AI's response text
- `session_id` (string) - Session identifier (returned even if empty string was sent)
- `request_id` (string, optional) - Unique identifier for this request
- `text_response_cleaned` (string, optional) - Cleaned version of the AI response
- `warning_message` (string, optional) - Any warning messages

**Example:**
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
- `400` - Missing required fields: `session_id`, `input`, or `config_id`
- `500` - Failed to send chat message

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
}

interface GetConfigsRequest {
  config_ids: string[];  // Array of character config IDs (max 50)
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

interface ErrorResponse {
  error: string;
  message?: string;
}
```

---

## Frontend Integration Guide

### Fetching Character List Example

```tsx
// Hook to fetch multiple character configs
export function useCharacters(configIds: string[]) {
  const [characters, setCharacters] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/configs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config_ids: configIds })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch characters');
      }

      const data = await response.json();
      setCharacters(data.configs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [configIds]);

  useEffect(() => {
    if (configIds.length > 0) {
      fetchCharacters();
    }
  }, [fetchCharacters]);

  return { characters, isLoading, error, refetch: fetchCharacters };
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

