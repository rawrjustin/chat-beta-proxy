# Token Refresh Debugging Summary

## Issue Identified

The token refresh mechanism is **not working**. All refresh attempts are failing with:

```
Error: Token refresh failed: 500 {"error":"Shim error: rpc error: code = Unauthenticated desc = invalid or expired refresh token"}
```

## What I Found

### 1. **Refresh Endpoint is Being Called Correctly**
- ✅ Endpoint: `https://api.genies.com/auth/v2/refresh-session`
- ✅ Method: POST
- ✅ Headers: `Content-Type: application/json`
- ✅ Body includes `refreshToken` and `organizationId`

### 2. **The Refresh Token is Being Rejected**
Even with the latest refresh token (`Pmo0ryv47uy1r7XGOjoDqmu08`), the auth service returns:
- **Status**: 500 Internal Server Error
- **Error**: "invalid or expired refresh token"

### 3. **Render Logs Show Consistent Failures**
From Render logs, the refresh is being attempted:
- Every 30 minutes (periodic refresh)
- On every API call when token is expired
- All attempts are failing with the same error

## Possible Causes

1. **Refresh Token Format/Validation**
   - The refresh token might need to be in a different format
   - The auth service might validate tokens differently than expected

2. **Refresh Token Expiration**
   - Refresh tokens might expire very quickly (even faster than access tokens)
   - The token might be invalidated when a new one is issued

3. **Endpoint or Authentication Method**
   - The refresh endpoint URL might be incorrect
   - Additional authentication headers might be required
   - The request format might need to be different

4. **Token Service Issues**
   - The auth service might have issues with refresh tokens
   - There might be a bug in the refresh token validation

## Current Status

### Code Implementation
✅ **Token refresh code is correctly implemented:**
- Checks token expiry before API calls
- Includes organizationId from token
- Handles errors gracefully
- Logs all refresh attempts

### What's Not Working
❌ **Refresh token validation:**
- All refresh tokens are being rejected by the auth service
- This happens immediately, even with freshly issued tokens

## Recommendations

### Short-term (Immediate)
1. **Use the access token directly** - Since refresh isn't working, rely on manually updating AUTH_TOKEN when it expires
2. **Monitor token expiry** - Set up alerts or check periodically
3. **Manual refresh process** - When tokens expire, get new ones and update on Render

### Long-term (Investigation Needed)
1. **Contact auth service team** to verify:
   - Correct refresh endpoint URL
   - Required request format
   - Refresh token validation rules
   - Expected refresh token lifetime

2. **Test refresh token immediately** after issuance:
   - Test within seconds of getting the token
   - Verify if it works at all

3. **Check if different endpoint or method is needed:**
   - Maybe there's a different refresh endpoint
   - Maybe additional headers are required
   - Maybe the refresh token needs to be used differently

## Current Workaround

Since automatic refresh isn't working:

1. **Monitor token expiry** - Check when tokens expire (usually ~1 hour)
2. **Get new tokens** - When expired, get new access and refresh tokens
3. **Update Render** - Update environment variables on Render
4. **Service will redeploy** - Render automatically redeploys when env vars change

The service will continue to work with the access token until it expires, then you'll need to update it manually.

## Testing

To test if a refresh token works:

```bash
node test-token-refresh-debug.js
```

This will:
- Show current token status
- Test the refresh endpoint
- Show detailed error information

## Next Steps

1. ✅ Updated tokens on Render (new access + refresh tokens)
2. ✅ Added organizationId to refresh requests
3. ✅ Improved error logging
4. ⚠️ **Need**: Verify refresh token format/validation with auth service team
5. ⚠️ **Need**: Test refresh token immediately after issuance

