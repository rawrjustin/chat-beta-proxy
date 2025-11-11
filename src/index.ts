import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat';
import { requestLogger, errorHandler } from './middleware/logger';
import { initChatService } from './services/chatService';
import { TokenRefreshService } from './services/tokenRefreshService';
import { getUserFromToken } from './utils/tokenUtils';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const TOKEN_REFRESH_URL = process.env.TOKEN_REFRESH_URL || 'https://api.dev.genies.com/auth/v2/refresh-session';
const TOKEN_REFRESH_INTERVAL = parseInt(process.env.TOKEN_REFRESH_INTERVAL || '30', 10); // minutes

// Validate required environment variables
if (!AUTH_TOKEN) {
  console.error('ERROR: AUTH_TOKEN environment variable is required');
  process.exit(1);
}

// Initialize token refresh service
const tokenRefreshService = new TokenRefreshService(
  AUTH_TOKEN,
  REFRESH_TOKEN || AUTH_TOKEN, // Use access token as fallback if no refresh token
  TOKEN_REFRESH_URL,
  (accessToken, refreshToken) => {
    // Callback when token is refreshed
    console.log('✅ Token updated successfully');
    // Note: In production, you might want to persist these to a database or file
  }
);

// Log user_id from initial token
const userInfo = getUserFromToken(AUTH_TOKEN);
if (userInfo?.userId) {
  console.log(`User ID: ${userInfo.userId}`);
} else {
  console.warn('Could not extract user_id from initial token');
}

// Start periodic token refresh (every 30 minutes by default)
if (REFRESH_TOKEN) {
  console.log(`🔄 Starting automatic token refresh every ${TOKEN_REFRESH_INTERVAL} minutes`);
  tokenRefreshService.startPeriodicRefresh(TOKEN_REFRESH_INTERVAL);
} else {
  console.log('⚠️  No REFRESH_TOKEN provided. Token refresh disabled.');
  console.log('   The current access token will be used without refresh.');
}

// Initialize chat service with token refresh service
initChatService(tokenRefreshService);

// Middleware
app.use(cors()); // Enable CORS for all origins (customize if needed)
app.use(express.json()); // Parse JSON request bodies
app.use(requestLogger); // Log all requests

// Serve static files (images, etc.)
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', chatRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Chat Proxy Server is running!

   Port: ${PORT}
   Environment: ${process.env.NODE_ENV || 'development'}
   Token Refresh: ${REFRESH_TOKEN ? `Enabled (every ${TOKEN_REFRESH_INTERVAL} min)` : 'Disabled'}

   Available endpoints:
   - GET  /health
   - GET  /api/characters
   - GET  /api/config/:configId
   - POST /api/configs
   - POST /api/sessions
   - POST /api/chat
   - POST /api/followups
  `);
});

export default app;
