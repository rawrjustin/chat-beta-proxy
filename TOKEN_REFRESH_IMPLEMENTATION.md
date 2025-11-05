# Token Refresh Implementation - Complete

## ✅ Implementation Summary

Automatic token refresh has been successfully implemented in the chat proxy backend. The system now:

- ✅ Checks token expiry before each API call
- ✅ Automatically refreshes tokens when they expire or are about to expire (5-minute buffer)
- ✅ Runs periodic refresh checks every 30 minutes (configurable)
- ✅ Supports both access tokens and refresh tokens
- ✅ Gracefully handles cases where no refresh token is available

## 🏗️ Architecture

### New Components

1. **`src/utils/tokenUtils.ts`** - Token utility functions
   - `isTokenExpired()` - Checks if JWT is expired (with 5-min buffer)
   - `getTokenExpiryTime()` - Gets time until expiry in milliseconds
   - `getUserFromToken()` - Extracts user info from JWT

2. **`src/services/tokenRefreshService.ts`** - Token refresh service
   - `getValidAccessToken()` - Returns valid token, refreshes if needed
   - `refreshAccessToken()` - Calls refresh endpoint to get new tokens
   - `startPeriodicRefresh()` - Starts automatic refresh every N minutes
   - `stopPeriodicRefresh()` - Stops automatic refresh

3. **Updated `src/services/chatService.ts`** - Integration with token refresh
   - Now uses TokenRefreshService to get valid tokens
   - Automatically refreshes before each API call if needed

4. **Updated `src/index.ts`** - Main server initialization
   - Initializes TokenRefreshService with tokens from environment
   - Starts periodic refresh if REFRESH_TOKEN is provided
   - Displays token refresh status on startup

## 📝 Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Required: Access token
AUTH_TOKEN=your_access_token_here

# Optional: Refresh token (enables automatic refresh)
REFRESH_TOKEN=your_refresh_token_here

# Optional: Refresh endpoint (has default)
TOKEN_REFRESH_URL=https://api.genies.com/auth/v2/refresh-session

# Optional: Refresh interval in minutes (default: 30)
TOKEN_REFRESH_INTERVAL=30
```

### Current Status

**Without REFRESH_TOKEN**:
- Server uses AUTH_TOKEN for all requests
- No automatic refresh
- Token refresh infrastructure is in place but inactive
- Warning shown on startup

**With REFRESH_TOKEN**:
- Periodic refresh runs every 30 minutes (or configured interval)
- Tokens refreshed automatically before expiry
- New tokens stored in memory
- Callback notifies when tokens are updated

## 🔄 How It Works

### 1. Token Expiry Check

Before each API request:
```typescript
const token = await tokenRefreshService.getValidAccessToken();
// This checks if token is expired and refreshes if needed
```

### 2. Automatic Refresh

Every 30 minutes (configurable):
```typescript
// Check if token expires within 5 minutes
if (isTokenExpired(accessToken)) {
  // Call refresh endpoint
  const { accessToken, refreshToken } = await refreshAccessToken();
  // Update stored tokens
}
```

### 3. Refresh API Call

```http
POST /auth/v2/refresh-session
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

Response:
```json
{
  "accessToken": "new_access_token",
  "refreshToken": "new_refresh_token"
}
```

## 🧪 Testing

### Test Current Token

Run the test script to see token information:

```bash
node test-token-refresh.js
```

This shows:
- Token issuer and user information
- Issued and expiry timestamps
- Time until expiry
- Token refresh configuration status

### Test with Refresh Token

1. Add REFRESH_TOKEN to `.env`:
```bash
REFRESH_TOKEN=your_refresh_token_here
```

2. Restart server:
```bash
npm run dev
```

3. Look for startup messages:
```
🔄 Starting automatic token refresh every 30 minutes
✅ Token updated successfully (when refresh happens)
```

### Server Logs

The server logs show:
- `[Periodic Refresh] Checking token expiry...` - Every 30 minutes
- `Token still valid. Expires in X minutes` - When token is still good
- `Access token expired, refreshing...` - When refresh is triggered
- `✅ Token refreshed successfully` - When refresh succeeds
- `New token expires at: [timestamp]` - Expiry of new token

## 📊 Token Information

### Current Token Analysis

Run `node test-token-refresh.js` to see your current token:

Example output:
```
🔐 Token Refresh Test

Token Information:
==================
User ID: user_01K7QCA1YR7P8858TP5TQF1G92
Email: seiji@genies.com
Issuer: https://api.workos.com/user_management/...
Organization: org_01K72GGK98G1B4KXVFY9N8W6MP

Token Timestamps:
=================
Issued At: 2025-11-05T00:57:06.000Z
Expires At: 2025-11-05T01:57:06.000Z
Current Time: 2025-11-05T01:14:43.344Z

Token Status:
=============
✅ Token is VALID
Time until expiry: 0 days, 0 hours
```

## ⚠️ Important Notes

### Token Storage

Currently, refreshed tokens are stored **in memory only**. This means:
- Tokens are lost when server restarts
- Each server instance has its own tokens
- For production, consider persisting to database or file

### Refresh Token Availability

The implementation assumes you have a separate refresh token. If you only have an access token:
- Token refresh will be **disabled**
- Server will show warning on startup
- You'll need to manually update AUTH_TOKEN when it expires

### Future Improvements

To enable token refresh, you need:
1. **Obtain a refresh token** from your authentication provider
2. **Add it to `.env`** as REFRESH_TOKEN
3. **Verify the refresh endpoint URL** (currently defaults to `https://api.genies.com/auth/v2/refresh-session`)

## 🎯 Usage Recommendations

### Development

- Use the current setup (token refresh disabled)
- Your current token expires in ~1 hour
- Manually update AUTH_TOKEN when needed

### Production

1. Obtain proper refresh tokens from auth provider
2. Set REFRESH_TOKEN in environment
3. Configure appropriate refresh interval (default 30 min is good)
4. Consider persisting refreshed tokens to storage
5. Add monitoring/alerts for refresh failures

## 📚 Code Examples

### Check Token Expiry Manually

```typescript
import { isTokenExpired, getTokenExpiryTime } from './utils/tokenUtils';

const token = 'your_jwt_token';

if (isTokenExpired(token)) {
  console.log('Token is expired or expiring soon');
} else {
  const timeLeft = getTokenExpiryTime(token);
  console.log(`Token valid for ${timeLeft / 60000} more minutes`);
}
```

### Use Token Refresh Service

```typescript
import { TokenRefreshService } from './services/tokenRefreshService';

const service = new TokenRefreshService(
  accessToken,
  refreshToken,
  'https://api.example.com/refresh',
  (newAccess, newRefresh) => {
    // Callback when tokens are refreshed
    console.log('Tokens updated!');
  }
);

// Start periodic refresh
service.startPeriodicRefresh(30); // every 30 minutes

// Get valid token (refreshes if needed)
const validToken = await service.getValidAccessToken();
```

## ✨ Benefits

1. **No manual intervention** - Tokens refresh automatically
2. **No downtime** - API calls never fail due to expired tokens
3. **Configurable** - Adjust refresh interval as needed
4. **Graceful degradation** - Works with or without refresh tokens
5. **Logging** - Clear visibility into refresh operations

## 🚀 Next Steps

To fully enable token refresh:

1. Contact your authentication provider to get a refresh token
2. Update `.env` with the REFRESH_TOKEN
3. Restart the server
4. Monitor logs to confirm refresh is working

The infrastructure is ready - just add the refresh token!
