# Railway Deployment Guide

## ✅ Setup Complete

Your project has been successfully set up for deployment on Railway!

### Project Details
- **Project Name:** chat-beta-proxy
- **Project ID:** 4abe18cb-0ce5-4916-9126-e399916cd82e
- **Service Name:** chat-beta-proxy
- **Service ID:** 12c648d6-4f7a-4273-b134-6190372234b1
- **Environment:** production
- **Domain:** https://chat-beta-proxy-production.up.railway.app

### Configuration Files
- `nixpacks.toml` - Build configuration for Railway/Nixpacks

## 🔧 Required Environment Variables

The following environment variables have been set:
- ✅ `NODE_ENV=production`
- ✅ `PORT=3000`
- ✅ `TOKEN_REFRESH_URL=https://api.dev.genies.com/auth/v2/refresh-session`
- ✅ `TOKEN_REFRESH_INTERVAL=25`

### ⚠️ Action Required: Set Authentication Tokens

You **must** set the following environment variables in Railway:

1. **AUTH_TOKEN** - Your authentication token (required)
2. **REFRESH_TOKEN** - Your refresh token (recommended for token refresh functionality)

### How to Set Environment Variables

**Option 1: Using Railway CLI**
```bash
cd /Users/justin-genies/Code/chat-beta-proxy
railway variables set AUTH_TOKEN=your_auth_token_here
railway variables set REFRESH_TOKEN=your_refresh_token_here
```

**Option 2: Using Railway Dashboard**
1. Go to: https://railway.com/project/4abe18cb-0ce5-4916-9126-e399916cd82e
2. Click on the `chat-beta-proxy` service
3. Go to the **Variables** tab
4. Add the following variables:
   - `AUTH_TOKEN` = (your authentication token)
   - `REFRESH_TOKEN` = (your refresh token)

## 🚀 Deployment Status

The initial deployment has been triggered. You can monitor it at:
- **Dashboard:** https://railway.com/project/4abe18cb-0ce5-4916-9126-e399916cd82e
- **Service:** https://railway.com/project/4abe18cb-0ce5-4916-9126-e399916cd82e/service/12c648d6-4f7a-4273-b134-6190372234b1

## 📋 Build Configuration

The project uses the following build process:
1. **Install:** `npm ci` (clean install)
2. **Build:** `npm run build` (TypeScript compilation)
3. **Start:** `npm start` (runs `node dist/index.js`)

## 🔍 Verify Deployment

Once deployment completes, test the service:

```bash
# Health check
curl https://chat-beta-proxy-production.up.railway.app/health

# Expected response:
# {"status":"ok","timestamp":"..."}
```

## 🔄 Automatic Deployments

Railway will automatically deploy when you push to the connected Git repository. To connect your repository:

1. Go to the Railway dashboard
2. Select your project
3. Click **Settings** → **Source**
4. Connect your GitHub repository

## 📝 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AUTH_TOKEN` | ✅ Yes | - | Authentication token for API calls |
| `REFRESH_TOKEN` | ⚠️ Recommended | - | Token for automatic refresh |
| `TOKEN_REFRESH_URL` | No | `https://api.dev.genies.com/auth/v2/refresh-session` | Token refresh endpoint |
| `TOKEN_REFRESH_INTERVAL` | No | `25` | Refresh interval in minutes |
| `PORT` | No | `3000` | Server port (Railway sets this automatically) |
| `NODE_ENV` | No | `production` | Node environment |

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Railway dashboard
- Verify `package.json` has correct build scripts
- Ensure TypeScript compiles successfully locally: `npm run build`

### Service Won't Start
- Verify `AUTH_TOKEN` is set
- Check service logs in Railway dashboard
- Ensure `PORT` environment variable is set (Railway sets this automatically)

### Health Check Fails
- Verify the service is running (check logs)
- Ensure all required environment variables are set
- Check that the build completed successfully

## 🔗 Quick Links

- **Railway Dashboard:** https://railway.com/project/4abe18cb-0ce5-4916-9126-e399916cd82e
- **Service URL:** https://chat-beta-proxy-production.up.railway.app
- **Health Check:** https://chat-beta-proxy-production.up.railway.app/health

## 📞 Next Steps

1. ✅ Set `AUTH_TOKEN` and `REFRESH_TOKEN` environment variables
2. ✅ Wait for initial deployment to complete
3. ✅ Test the health endpoint
4. ✅ Connect your GitHub repository for automatic deployments (optional)

