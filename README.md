# Chat Proxy Backend

A proxy backend that masks API calls to the Genies chat service, handling authentication and providing a simplified API for frontend chat applications.

## Features

- Masks upstream chat API endpoints
- Handles authentication with hardcoded Bearer token (stored in environment variables)
- Session-based chat management
- CORS enabled for frontend access
- TypeScript for type safety
- Request logging and error handling

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the AUTH_TOKEN:

```bash
cp .env.example .env
```

Edit `.env` and replace `your_bearer_token_here` with your actual Bearer token.

### 3. Run the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

### Get Character Config
```
GET /api/config/:configId
```
Fetches the configuration for a specific character.

**Example:**
```bash
curl http://localhost:3000/api/config/CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4
```

### Create Chat Session
```
POST /api/sessions
```
Creates a new chat session for a character.

**Request body:**
```json
{
  "config_id": "CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4"
}
```

**Response:**
```json
{
  "id": "session_id_here",
  "status": "active",
  "config_id": "CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4"
}
```

### Send Chat Message
```
POST /api/chat
```
Sends a message to the chat API and receives AI response.

**Request body:**
```json
{
  "session_id": "your_session_id",
  "config_id": "CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4",
  "input": "Hello, how are you?"
}
```

**Response:**
```json
{
  "ai": "I'm doing great, thanks for asking!",
  "session_id": "your_session_id",
  "request_id": "...",
  "text_response_cleaned": "I'm doing great, thanks for asking!",
  "warning_message": null
}
```

## Frontend Integration

### Example Chat Flow

1. **Create a session** (do this once per conversation):
```javascript
const response = await fetch('http://localhost:3000/api/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    config_id: 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4'
  })
});
const session = await response.json();
const sessionId = session.id;
```

2. **Send messages** (use the session_id from step 1):
```javascript
const response = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: sessionId,
    config_id: 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4',
    input: 'Hello!'
  })
});
const chatResponse = await response.json();
console.log('AI:', chatResponse.ai);
```

## Project Structure

```
chat-proxy/
├── src/
│   ├── routes/
│   │   └── chat.ts          # API route handlers
│   ├── services/
│   │   └── chatService.ts   # Upstream API client
│   ├── middleware/
│   │   └── logger.ts        # Request logging and error handling
│   ├── types/
│   │   └── chat.ts          # TypeScript type definitions
│   └── index.ts             # Express server setup
├── .env                      # Environment variables (gitignored)
├── .env.example              # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Security Notes

- The `.env` file is gitignored to prevent accidentally committing secrets
- The AUTH_TOKEN should be kept secure and not shared
- Consider adding rate limiting for production use
- CORS is currently open to all origins - customize in `src/index.ts` if needed

## Future Enhancements

- [ ] Implement automatic token refresh logic
- [ ] Add rate limiting
- [ ] Add request validation middleware
- [ ] Support for additional chat features (images, voice, etc.)
- [ ] Add comprehensive error handling for token expiration

## License

ISC
