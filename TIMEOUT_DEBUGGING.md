# Timeout Debugging Guide

## Overview

This document explains the timeout debugging features added to help diagnose 504 Gateway Timeout errors.

## What Was Added

### 1. Request Timeout Configuration

- **API_TIMEOUT**: Default 120 seconds (2 minutes) for main API calls
- **PREPROMPT_TIMEOUT**: Default 30 seconds for preprompt generation
- Both can be configured via environment variables:
  ```bash
  API_TIMEOUT=120000        # milliseconds
  PREPROMPT_TIMEOUT=30000   # milliseconds
  ```

### 2. Detailed Request Logging

Every API request now logs:

- **Request ID**: Unique identifier for tracking requests
- **Start time**: When the request began
- **Token acquisition time**: How long it took to get/refresh the token
- **Fetch time**: How long the actual HTTP request took
- **Response read time**: How long it took to read the response body
- **Total time**: End-to-end request duration
- **Request details**: Method, endpoint, body size
- **Response details**: Status, headers, response size

### 3. Timeout Handling

- Client-side timeouts using `Promise.race` (compatible with node-fetch v2)
- Clear timeout error messages with timing information
- Distinguishes between client timeouts and server 504 errors

## Debugging Timeout Issues

### Understanding the Logs

When a timeout occurs, you'll see logs like:

```
[POST_/v2/chat_1234567890] Starting request: {
  endpoint: '/v2/chat',
  method: 'POST',
  hasBody: true,
  bodySize: 1234,
  timeout: 120000
}
[POST_/v2/chat_1234567890] Token obtained in 45ms
[POST_/v2/chat_1234567890] Response received: {
  status: 504,
  statusText: 'Gateway Timeout',
  fetchTime: '120000ms',
  totalTime: '120045ms',
  headers: {...}
}
[POST_/v2/chat_1234567890] Request failed: {
  status: 504,
  statusText: 'Gateway Timeout',
  errorText: '{"message": "Endpoint request timed out"}',
  errorTextReadTime: '5ms',
  totalTime: '120050ms'
}
```

### Key Metrics to Watch

1. **Token Time**: Should be < 100ms typically. If higher, token refresh might be slow.
2. **Fetch Time**: The actual HTTP request duration. If this approaches the timeout, the upstream API is slow.
3. **Total Time**: End-to-end duration. Helps identify where time is being spent.

### Common Scenarios

#### Scenario 1: Upstream API is Slow
```
fetchTime: '115000ms'  // Close to timeout
totalTime: '115045ms'
```
**Solution**: The upstream API (`https://chat.dev.genies.com`) is taking too long. This could be:
- High load on the upstream service
- Network issues
- Large request/response payloads

#### Scenario 2: Client-Side Timeout
```
[Request timeout: {
  timeout: 120000,
  totalTime: '120000ms',
  error: 'Request timeout after 120000ms'
}]
```
**Solution**: Increase `API_TIMEOUT` if the upstream API legitimately needs more time, or investigate why requests are slow.

#### Scenario 3: Token Refresh is Slow
```
Token obtained in 5000ms  // Should be < 100ms
```
**Solution**: Check token refresh service configuration and network connectivity to auth endpoint.

## Environment Variables

Add these to your `.env` file to customize timeouts:

```bash
# Main API timeout (milliseconds)
API_TIMEOUT=120000

# Preprompt generation timeout (milliseconds)
PREPROMPT_TIMEOUT=30000
```

## Best Practices

1. **Monitor the logs**: Watch for patterns in timing metrics
2. **Set appropriate timeouts**: Balance between user experience and allowing legitimate slow requests
3. **Investigate upstream issues**: If fetch times are consistently high, the issue is likely with the upstream API
4. **Check network conditions**: Slow networks can cause timeouts even with reasonable timeout values

## Troubleshooting Steps

1. **Check the logs** for the request ID mentioned in the error
2. **Look at timing breakdown**:
   - Is token acquisition slow?
   - Is the fetch itself slow?
   - Is response reading slow?
3. **Compare with successful requests**: What's different?
4. **Check upstream API status**: Is `https://chat.dev.genies.com` experiencing issues?
5. **Adjust timeouts** if needed: Increase `API_TIMEOUT` for legitimate slow operations

## Example: Debugging a 504 Error

```
Error: Request failed: 504 {"message": "Endpoint request timed out"}
```

Look for the corresponding request log:
```
[POST_/v2/chat_1234567890] Starting request: ...
[POST_/v2/chat_1234567890] Token obtained in 50ms
[POST_/v2/chat_1234567890] Response received: {
  status: 504,
  fetchTime: '120000ms',  // This tells you the upstream timed out
  totalTime: '120050ms'
}
```

This shows:
- Token acquisition was fast (50ms)
- The upstream API took the full 120 seconds before timing out
- The issue is with the upstream service, not your proxy

## Next Steps

If timeouts persist:
1. Contact the upstream API team about performance issues
2. Consider implementing retry logic with exponential backoff
3. Add request queuing if requests are backing up
4. Monitor upstream API health and implement circuit breakers

