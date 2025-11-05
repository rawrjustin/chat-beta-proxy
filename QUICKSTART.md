# Quick Start Guide

Get your chat proxy backend up and running in 3 steps!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Your Token

The `.env` file has been pre-configured with the token from your documentation. If you need to update it:

```bash
# Edit .env and update the AUTH_TOKEN value
```

## Step 3: Start the Server

```bash
npm run dev
```

You should see:
```
🚀 Chat Proxy Server is running!

   Port: 3000
   Environment: development

   Available endpoints:
   - GET  /health
   - GET  /api/config/:configId
   - POST /api/sessions
   - POST /api/chat
```

## Test It Out

In a new terminal, run the test script:

```bash
node test-api.js
```

This will:
1. Check server health
2. Create a new chat session
3. Send a message
4. Send a follow-up message in the same session

## Usage from Frontend

### 1. Create a Session (once per conversation)

```javascript
const createSession = async () => {
  const response = await fetch('http://localhost:3000/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      config_id: 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4'
    })
  });
  const { id } = await response.json();
  return id; // Save this for the conversation
};
```

### 2. Send Messages

```javascript
const sendMessage = async (sessionId, userInput) => {
  const response = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      config_id: 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4',
      input: userInput
    })
  });
  const { ai } = await response.json();
  return ai; // This is the AI's response
};
```

### 3. Complete Chat Example

```javascript
// Initialize conversation
const sessionId = await createSession();

// Chat loop
const userMessage = "Hello!";
const aiResponse = await sendMessage(sessionId, userMessage);
console.log('User:', userMessage);
console.log('AI:', aiResponse);
```

## Important Notes

### Character Configuration

The default character ID is: `CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4`

To use a different character, you can fetch available configs:
```bash
curl http://localhost:3000/api/config/YOUR_CONFIG_ID
```

### Session Management

- Sessions are created per conversation
- Use the same `session_id` for all messages in a conversation
- The frontend should generate/track session IDs
- Each new conversation needs a new session

### Token Refresh

The current implementation uses a hardcoded token. When the token expires, you'll need to:
1. Get a new token from the auth service
2. Update the `AUTH_TOKEN` in `.env`
3. Restart the server

Token refresh logic can be added in a future iteration.

## Troubleshooting

### "AUTH_TOKEN environment variable is required"
- Make sure `.env` file exists
- Check that `AUTH_TOKEN` is set in `.env`

### "Request failed: 401"
- Your token may have expired
- Update the `AUTH_TOKEN` in `.env` with a fresh token

### "ECONNREFUSED"
- Make sure the server is running (`npm run dev`)
- Check that you're using the correct port (default: 3000)

### CORS errors from frontend
- The server has CORS enabled for all origins
- If you need to restrict origins, edit `src/index.ts`

## Next Steps

- Integrate with your frontend chat UI
- Customize CORS settings if needed
- Add error handling in your frontend
- Consider adding rate limiting for production
- Plan token refresh implementation

Happy chatting! 🎉
