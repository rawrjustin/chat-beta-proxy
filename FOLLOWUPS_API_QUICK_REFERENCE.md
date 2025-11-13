# Follow-ups API - Quick Reference for Frontend

## ⚠️ Important Update

**The chat endpoints (`/api/chat` and `/api/initial-message`) now automatically generate and return preprompts!** You can optionally pass `conversation_history` to these endpoints for better contextual follow-ups.

**You only need to call `/api/followups` separately if:**
- You want to regenerate follow-ups without sending a new message
- You need to update follow-ups based on new conversation context

## Chat Endpoints (Automatic Preprompts)

### POST /api/chat
Automatically generates preprompts and includes them in the response.

```javascript
const response = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: '...',
    config_id: 'CHAR_...',
    input: 'User message',
    conversation_history: [  // Optional: Up to 8 messages for better context
      { role: 'user', content: '...' },
      { role: 'assistant', content: '...' },
      // ... up to 8 messages total
    ]
  })
});

const data = await response.json();
console.log(data.preprompts); // 4 preprompts automatically generated
```

### POST /api/initial-message
Also automatically generates preprompts.

```javascript
const response = await fetch('http://localhost:3000/api/initial-message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: '...',
    config_id: 'CHAR_...',
    conversation_history: [  // Optional: Previous messages
      { role: 'user', content: '...' },
      { role: 'assistant', content: '...' }
    ]
  })
});

const data = await response.json();
console.log(data.preprompts); // 4 preprompts automatically generated
```

---

## Separate Follow-ups Endpoint

### POST /api/followups
Use this endpoint if you need to regenerate follow-ups without sending a new message.

## Request Format

### Recommended: Using `conversation_history`
```json
{
  "conversation_history": [
    { "role": "user", "content": "User message 1" },
    { "role": "assistant", "content": "AI response 1" },
    { "role": "user", "content": "User message 2" },
    { "role": "assistant", "content": "AI response 2" }
    // ... up to 8 messages total (4 pairs)
  ],
  "config_id": "CHAR_..." // Optional but recommended
}
```

### Legacy Format (Still Supported)
```json
{
  "user_turn": "Last user message",
  "assistant_turn": "Last AI response",
  "config_id": "CHAR_..." // Optional
}
```

## Response Format
```json
{
  "preprompts": [
    {
      "type": "roleplay",
      "prompt": "Full prompt text to send when clicked",
      "simplified_text": "Short text for UI display"
    },
    {
      "type": "roleplay",
      "prompt": "...",
      "simplified_text": "..."
    },
    {
      "type": "conversation",
      "prompt": "...",
      "simplified_text": "..."
    },
    {
      "type": "conversation",
      "prompt": "...",
      "simplified_text": "..."
    }
  ]
}
```

## Key Points

1. **Maximum 8 messages** (4 pairs of user/assistant)
2. **Send last 4 pairs** from your chat history when available
3. **Display `simplified_text`** in UI, but send `prompt` when user clicks
4. **First 2 are roleplay**, last 2 are conversation type
5. **Always returns exactly 4 preprompts**

## Quick JavaScript Example

```javascript
// Get last 4 pairs from chat messages
function getLastFourPairs(messages) {
  return messages
    .filter(msg => msg.role === 'user' || msg.role === 'assistant')
    .slice(-8); // Last 8 messages = 4 pairs
}

// Call API
async function generateFollowUps(messages, configId) {
  const response = await fetch('http://localhost:3000/api/followups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversation_history: getLastFourPairs(messages),
      config_id: configId
    })
  });
  
  const data = await response.json();
  return data.preprompts;
}

// Usage
const chatMessages = [
  { role: 'user', content: 'Hello' },
  { role: 'assistant', content: 'Hi!' },
  // ... more messages
];

const preprompts = await generateFollowUps(chatMessages, 'CHAR_...');

// Display simplified_text, but send prompt when clicked
preprompts.forEach(p => {
  button.textContent = p.simplified_text;
  button.onclick = () => sendMessage(p.prompt); // Use full prompt
});
```

## TypeScript Types

```typescript
interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface FollowUpsRequest {
  conversation_history?: ConversationMessage[]; // Up to 8 messages
  user_turn?: string;                           // Legacy
  assistant_turn?: string;                     // Legacy
  config_id?: string;
}

interface Preprompt {
  type: 'roleplay' | 'conversation';
  prompt: string;           // Send this when user clicks
  simplified_text: string;  // Display this in UI
}

interface FollowUpsResponse {
  preprompts: Preprompt[];
}
```

## Error Handling

- `400` - Invalid request (check error message for details)
- `500` - Server error

## Best Practices

### For Chat Endpoints (`/api/chat`, `/api/initial-message`)
1. ✅ **Pass `conversation_history`** - Include last 4 pairs (8 messages) for better contextual preprompts
2. ✅ **Use preprompts from response** - They're automatically generated and included
3. ✅ **Display `simplified_text`** - Show short version in UI, but send `prompt` when clicked
4. ✅ **Update history after each message** - Keep conversation_history up to date

### For Separate Follow-ups Endpoint (`/api/followups`)
1. ✅ Only call if you need to regenerate follow-ups without sending a new message
2. ✅ Show loading state while generating
3. ✅ Handle cases with fewer than 8 messages (send what you have)
4. ✅ Display `simplified_text` but send `prompt` on click

## Quick Comparison

| Endpoint | Preprompts | When to Use |
|----------|-----------|-------------|
| `POST /api/chat` | ✅ Automatic | Sending a message (recommended) |
| `POST /api/initial-message` | ✅ Automatic | Getting initial greeting |
| `POST /api/followups` | Manual call | Regenerating follow-ups without new message |

---

**Full Documentation:** See `API_DOCUMENTATION.md` for complete details and React examples.

