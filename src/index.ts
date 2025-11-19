import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import chatRoutes from './routes/chat';
import adminRoutes from './routes/admin';
import betaRoutes from './routes/beta';
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
// Token refresh interval: Set to 25 minutes for 60-minute TTL tokens
// This ensures we refresh well before the 5-minute expiration buffer
// Formula: (TTL - buffer) / 2 = (60 - 5) / 2 ≈ 25-30 minutes
const TOKEN_REFRESH_INTERVAL = parseInt(process.env.TOKEN_REFRESH_INTERVAL || '25', 10); // minutes

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

// Pre-validate and refresh token at startup to avoid first-request latency
// This ensures the token is ready before the server accepts requests
async function initializeToken() {
  const initStartTime = Date.now();
  console.log('🔐 Pre-validating token at startup...');
  
  try {
    await tokenRefreshService.getValidAccessToken();
    const initTime = Date.now() - initStartTime;
    console.log(`✅ Token ready (took ${initTime}ms)`);
  } catch (error) {
    console.error('⚠️  Token initialization failed:', error);
    console.error('   Server will start anyway, but first request may be slower');
  }
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

// Initialize database (if DATABASE_URL is available)
async function initializeDatabase() {
  if (process.env.DATABASE_URL) {
    try {
      const { initializeDatabase: initDb } = await import('./services/database');
      await initDb();
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('⚠️  Database initialization failed:', error);
      console.error('   Password protection will not work until database is configured');
    }
  } else {
    console.log('ℹ️  DATABASE_URL not set - password protection will not persist across deployments');
    console.log('   Add a PostgreSQL service in Railway to enable password persistence');
  }
}

// Middleware
app.use(cors()); // Enable CORS for all origins (customize if needed)
// Limit request body size to prevent memory issues (10MB max)
app.use(express.json({ limit: '10mb' })); // Parse JSON request bodies
app.use(requestLogger); // Log all requests

// Serve static files (images, etc.)
// Use absolute path that works in both development and production
// In dev: __dirname is src/, so ../public resolves to project root/public
// In prod: __dirname is dist/, so ../public resolves to project root/public
const publicPath = path.join(__dirname, '..', 'public');
console.log(`📁 Serving static files from: ${publicPath}`);
app.use(express.static(publicPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', chatRoutes);

// Admin routes
app.use('/admin', adminRoutes);

// Beta signup page
app.use('/beta', betaRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server after token and database initialization
Promise.all([
  initializeToken(),
  initializeDatabase()
]).then(() => {
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
   - GET  /admin (password protected)
   - GET  /beta (beta signup page)
    `);
  });
}).catch((error) => {
  console.error('❌ Failed to initialize server:', error);
  process.exit(1);
});

export default app;
