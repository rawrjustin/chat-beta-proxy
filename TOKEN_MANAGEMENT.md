# Token Management & Expiration Prevention

## How Token Expiration Prevention Works

The system has **automatic token refresh** built in to prevent expiration. Here's how it works:

### 1. **Automatic Refresh Before API Calls**

Before every API call, the system checks if the token is expired:
- If expired or expiring within 5 minutes → **automatically refreshes**
- If still valid → uses current token

```typescript
// This happens automatically before every chat API call
const token = await tokenRefreshService.getValidAccessToken();
// ↑ Automatically refreshes if needed
```

### 2. **Periodic Background Refresh**

Every 30 minutes (configurable), the system:
- Checks token expiry
- Refreshes if token expires within 5 minutes
- Logs the status

### 3. **5-Minute Safety Buffer**

The system refreshes tokens **5 minutes before they expire** to prevent any interruption:
```typescript
// Token expires at 2:00 PM
// System refreshes at 1:55 PM (5 minutes early)
```

## Current Token Status

Your current setup:
- ✅ **AUTH_TOKEN**: Set (but expired - needs refresh)
- ✅ **REFRESH_TOKEN**: Set (`XhooHbiL123rQz2t4nzuGXcnb`)
- ✅ **Token Refresh**: Enabled and configured

## What You Need

### Option 1: Use Valid Refresh Token (Recommended)

The refresh token you have should work. If it's not working, you may need a **valid refresh token** from the auth service.

**To get new tokens:**
1. Log in to the Genies admin/auth system
2. Get a new access token and refresh token
3. Update both in `.env`:
   ```bash
   AUTH_TOKEN=new_access_token
   REFRESH_TOKEN=new_refresh_token
   ```
4. Restart the server

### Option 2: Get Longer-Lived Tokens

If you can get tokens with longer expiration times from the auth service, that reduces refresh frequency.

## How the System Prevents Expiration

### Automatic Refresh Flow:

```
1. API Call Requested
   ↓
2. Check: Is token expired or expiring in < 5 minutes?
   ↓ Yes
3. Call refresh endpoint with REFRESH_TOKEN
   ↓
4. Get new AUTH_TOKEN and REFRESH_TOKEN
   ↓
5. Update tokens in memory
   ↓
6. Make API call with new token
   ↓
7. Return response
```

### Periodic Refresh Flow:

```
Every 30 minutes:
   ↓
Check token expiry
   ↓
If expires in < 5 minutes:
   ↓
Refresh token automatically
   ↓
Log new expiration time
```

## Configuration

### Environment Variables

```bash
# Required: Current access token
AUTH_TOKEN=your_access_token

# Required for auto-refresh: Refresh token
REFRESH_TOKEN=your_refresh_token

# Optional: Refresh endpoint (has default)
TOKEN_REFRESH_URL=https://api.genies.com/auth/v2/refresh-session

# Optional: How often to check (default: 30 minutes)
TOKEN_REFRESH_INTERVAL=30
```

### Reducing Refresh Interval

To check more frequently (e.g., every 10 minutes):

```bash
TOKEN_REFRESH_INTERVAL=10
```

## Troubleshooting

### Issue: "Token refresh failed: invalid or expired refresh token"

**Solution:** You need a **valid refresh token**. The current one may have expired.

1. Get a new refresh token from the auth service
2. Update `REFRESH_TOKEN` in `.env`
3. Restart server

### Issue: Tokens keep expiring

**Solution:** The refresh mechanism should prevent this. Check:
1. Is `REFRESH_TOKEN` set in `.env`?
2. Is the refresh token valid?
3. Is the refresh endpoint URL correct?
4. Check server logs for refresh errors

### Issue: Manual token updates needed

**Solution:** The automatic refresh should handle this. If you're manually updating:
- The refresh token might be invalid
- The refresh endpoint might be incorrect
- Check server logs for errors

## Best Practices

1. **Always set REFRESH_TOKEN** - This enables automatic refresh
2. **Monitor server logs** - Watch for refresh errors
3. **Use valid refresh tokens** - Refresh tokens can expire too (though they last longer)
4. **Set appropriate refresh interval** - 30 minutes is usually fine, but you can reduce if needed

## Token Lifecycle

```
Access Token Lifetime: ~1 hour (typical)
Refresh Token Lifetime: Days/Weeks (depends on auth service)

When Access Token Expires:
  → System automatically uses Refresh Token
  → Gets new Access Token + new Refresh Token
  → Updates in memory
  → Continues working seamlessly
```

## Summary

**You don't need to manually prevent expiration** - the system does it automatically if:
1. ✅ `REFRESH_TOKEN` is set
2. ✅ Refresh token is valid
3. ✅ Server is running

The system will:
- ✅ Refresh tokens before they expire (5-minute buffer)
- ✅ Refresh on every API call if needed
- ✅ Run periodic checks every 30 minutes
- ✅ Keep tokens valid indefinitely (as long as refresh token is valid)

**Current Issue:** Your refresh token might be invalid. Get a new valid refresh token from the auth service and update it in `.env`.

