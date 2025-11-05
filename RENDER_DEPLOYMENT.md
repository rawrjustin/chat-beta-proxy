# Render Deployment Configuration

## Service Details

**Service Name:** `chat-proxy`  
**Service ID:** `srv-d45d78p5pdvs73bvdr8g`  
**URL:** https://chat-proxy-qbmj.onrender.com  
**Dashboard:** https://dashboard.render.com/web/srv-d45d78p5pdvs73bvdr8g  
**Region:** Oregon  
**Plan:** Starter  
**Runtime:** Node.js

## Repository

**Repository:** https://github.com/rawrjustin/archety  
**Branch:** master  
**Auto Deploy:** Enabled (deploys on commit)

⚠️ **Important:** The service is currently configured to use the same repository as `archety-backend`. You have two options:

1. **Use a subdirectory:** If the chat-proxy code is in a subdirectory of the archety repo, you'll need to set the `rootDir` in Render dashboard
2. **Use a separate repository:** Create a new GitHub repository for chat-proxy and update the repository URL in Render

## Build Configuration

**Build Command:** `npm install && npm run build`  
**Start Command:** `npm start`

## Environment Variables

The following environment variables have been configured:

- `PORT` = `3000`
- `NODE_ENV` = `production`
- `AUTH_TOKEN` = (configured)
- `REFRESH_TOKEN` = (configured)
- `TOKEN_REFRESH_URL` = `https://api.genies.com/auth/v2/refresh-session`
- `TOKEN_REFRESH_INTERVAL` = `30`

## Deployment Status

Check deployment status at: https://dashboard.render.com/web/srv-d45d78p5pdvs73bvdr8g

## Next Steps

1. **If using the same repository:**
   - Ensure the chat-proxy code is in the repository
   - If it's in a subdirectory, set `rootDir` in Render dashboard to point to that directory
   - Push your code to the `master` branch

2. **If using a separate repository:**
   - Create a new GitHub repository for chat-proxy
   - Update the repository URL in Render dashboard
   - Push your code to the repository

3. **Verify deployment:**
   - Wait for the build to complete
   - Test the health endpoint: https://chat-proxy-qbmj.onrender.com/health
   - Update your frontend API base URL to use the Render URL

## Testing the Deployment

Once deployed, test the service:

```bash
# Health check
curl https://chat-proxy-qbmj.onrender.com/health

# Create session
curl -X POST https://chat-proxy-qbmj.onrender.com/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"config_id": "CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4"}'
```

## Updating Environment Variables

To update environment variables:

1. Go to: https://dashboard.render.com/web/srv-d45d78p5pdvs73bvdr8g
2. Navigate to "Environment" tab
3. Add or update variables
4. Save changes (service will redeploy automatically)

## Monitoring

- **Logs:** Available in Render dashboard
- **Metrics:** Available in Render dashboard
- **Health Checks:** Configure health check path if needed

## Important Notes

- The service uses automatic token refresh - tokens are refreshed in the background
- CORS is enabled for all origins (adjust for production if needed)
- The service is configured to use port 3000 (Render will handle port mapping)
- Environment variables containing tokens are secure and not exposed

