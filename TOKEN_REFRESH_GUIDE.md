# Token Refresh Implementation Guide

Based on the demo code in `/demo/genies-admin-main`, here's how to implement token refresh for the chat proxy backend.

## Key Findings from Demo Code

### 1. Token Refresh Endpoint

The demo uses a token refresh API:

**Endpoint**: `POST /auth/v2/refresh-session`

**Request**:
```json
{
  "refreshToken": "your_refresh_token_here",
  "organizationId": "optional_org_id" // Optional
}
```

**Response**:
```json
{
  "accessToken": "new_access_token",
  "refreshToken": "new_refresh_token"
}
```

### 2. Token Management Pattern

The demo implements a complete token management system:

**File**: `demo/genies-admin-main/src/lib/auth/tokens.ts`

Key functions:
- `isTokenExpired(token)` - Checks if a JWT token is expired by decoding and checking `exp` claim
- `getValidAccessToken()` - Gets current token, refreshes if expired
- `storeTokens()` - Stores access and refresh tokens
- `clearTokens()` - Clears tokens on logout

**Token Expiry Check**:
```typescript
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};
```

### 3. Automatic Token Refresh Logic

**File**: `demo/genies-admin-main/src/lib/auth/tokens.ts` (lines 63-126)

The `getValidAccessToken()` function implements automatic refresh:

1. Check if current access token exists and is not expired
2. If expired but refresh token exists, call refresh endpoint
3. Store new tokens
4. Return new access token
5. If refresh fails, clear all tokens

### 4. API Base URL

The demo uses environment variables for the API base URL:
- `process.env.NEXT_PUBLIC_GENIES_SHIM_API_URL`

Based on the pattern, the refresh endpoint would be at:
- `https://[base_url]/auth/v2/refresh-session`

## Implementation Plan for Chat Proxy

### Option 1: Simple Manual Refresh (Current Status)

Keep the current hardcoded token approach. When it expires:
1. User manually gets new token
2. Updates `.env` file
3. Restarts server

**Pros**: Simple, no additional complexity
**Cons**: Requires manual intervention when token expires

### Option 2: Automatic Refresh with Refresh Token

Implement automatic token refresh similar to the demo:

1. **Store both access and refresh tokens**:
```typescript
// In .env
AUTH_ACCESS_TOKEN=your_access_token
AUTH_REFRESH_TOKEN=your_refresh_token
```

2. **Add token expiry checking**:
```typescript
import { jwtDecode } from 'jwt-decode';

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};
```

3. **Implement refresh service**:
```typescript
async function refreshAccessToken(refreshToken: string) {
  const response = await fetch('https://[API_URL]/auth/v2/refresh-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  const data = await response.json();
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken
  };
}
```

4. **Update chatService to check/refresh before each request**:
```typescript
private async getValidToken(): Promise<string> {
  if (!isTokenExpired(this.token)) {
    return this.token;
  }

  // Token expired, refresh it
  const { accessToken, refreshToken } = await refreshAccessToken(this.refreshToken);
  this.token = accessToken;
  this.refreshToken = refreshToken;

  // Optionally: update .env or store in memory
  return accessToken;
}
```

### Option 3: Periodic Background Refresh

Set up a background job that refreshes the token before it expires:

1. Decode token to get expiry time
2. Schedule refresh 5 minutes before expiry
3. Automatically refresh in background
4. Update in-memory token

```typescript
setInterval(async () => {
  const decoded = jwtDecode(currentToken);
  const expiresIn = (decoded.exp * 1000) - Date.now();

  if (expiresIn < 5 * 60 * 1000) { // 5 minutes
    const newTokens = await refreshAccessToken(refreshToken);
    updateTokens(newTokens);
  }
}, 60 * 1000); // Check every minute
```

## Required Information

To implement automatic refresh, you'll need:

1. **Refresh Token**: The long-lived refresh token (different from access token)
2. **Refresh Endpoint URL**: Full URL to the refresh endpoint
3. **API Base URL**: The base URL for the auth service

## Current Token Analysis

Your current token from `/Users/sage1/Downloads/key.txt`:
- Issuer: `https://api.workos.com/user_management/...`
- Expiration: January 2055 (very long-lived)
- Type: WorkOS JWT

Since this token expires in 2055, automatic refresh may not be immediately necessary. However, implementing it now will make the system more robust for future tokens.

## Next Steps

1. **Determine if you have a refresh token** - Check if there's a separate refresh token available
2. **Find the refresh endpoint** - Confirm the exact URL for token refresh
3. **Choose implementation approach** - Pick Option 1, 2, or 3 based on your needs
4. **Test with actual tokens** - Verify the refresh flow works with real tokens

## References

- Demo token management: `/demo/genies-admin-main/src/lib/auth/tokens.ts`
- Demo refresh hook: `/demo/genies-admin-main/src/lib/auth/useRefreshAccessToken.ts`
- Demo auth context: `/demo/genies-admin-main/src/lib/auth/AuthContext.tsx`
