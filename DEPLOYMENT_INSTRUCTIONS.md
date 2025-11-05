# Deployment Instructions - Chat Beta Proxy

## ✅ Completed Steps

1. **GitHub Repository Created**
   - Repository: https://github.com/rawrjustin/chat-beta-proxy
   - Status: Repository created and ready

2. **Local Git Repository**
   - Git initialized
   - All files committed
   - Remote configured: `origin -> https://github.com/rawrjustin/chat-beta-proxy.git`
   - Branch: `main`

3. **Render Service Created**
   - Service Name: `chat-proxy`
   - Service ID: `srv-d45d78p5pdvs73bvdr8g`
   - URL: https://chat-proxy-qbmj.onrender.com
   - Dashboard: https://dashboard.render.com/web/srv-d45d78p5pdvs73bvdr8g

## 📋 Next Steps

### Step 1: Push Code to GitHub

You need to push the code to GitHub. Since the repository requires authentication, you can do this in one of two ways:

**Option A: Using GitHub CLI (if installed)**
```bash
cd /Users/sage1/Code/chat-proxy
gh auth login
git push -u origin main
```

**Option B: Using Personal Access Token**
```bash
cd /Users/sage1/Code/chat-proxy
# Push using token (replace YOUR_TOKEN with your GitHub personal access token)
git remote set-url origin https://YOUR_TOKEN@github.com/rawrjustin/chat-beta-proxy.git
git push -u origin main
# Then reset to normal URL
git remote set-url origin https://github.com/rawrjustin/chat-beta-proxy.git
```

**Option C: Using SSH (if SSH key is set up)**
```bash
cd /Users/sage1/Code/chat-proxy
git remote set-url origin git@github.com:rawrjustin/chat-beta-proxy.git
git push -u origin main
```

### Step 2: Update Render Service Repository

1. Go to: https://dashboard.render.com/web/srv-d45d78p5pdvs73bvdr8g
2. Click on **"Settings"** tab
3. Scroll down to **"Repository"** section
4. Click **"Change Repository"** or **"Edit"**
5. Update the repository URL to: `https://github.com/rawrjustin/chat-beta-proxy`
6. Update the branch to: `main` (if not already set)
7. Click **"Save Changes"**

### Step 3: Verify Environment Variables

The following environment variables should already be configured in Render:

- `PORT` = `3000`
- `NODE_ENV` = `production`
- `AUTH_TOKEN` = (your current token)
- `REFRESH_TOKEN` = (your current refresh token)
- `TOKEN_REFRESH_URL` = `https://api.genies.com/auth/v2/refresh-session`
- `TOKEN_REFRESH_INTERVAL` = `30`

To verify/update:
1. Go to: https://dashboard.render.com/web/srv-d45d78p5pdvs73bvdr8g
2. Click **"Environment"** tab
3. Verify all variables are set correctly
4. Update `AUTH_TOKEN` and `REFRESH_TOKEN` if needed

### Step 4: Trigger Deployment

After updating the repository URL in Render:

1. Render will automatically detect the change
2. A new deployment will be triggered automatically
3. Monitor the deployment at: https://dashboard.render.com/web/srv-d45d78p5pdvs73bvdr8g

### Step 5: Verify Deployment

Once deployment completes:

```bash
# Test health endpoint
curl https://chat-proxy-qbmj.onrender.com/health

# Expected response:
# {"status":"ok","timestamp":"..."}
```

## 🔧 Current Configuration

**Build Command:** `npm install && npm run build`  
**Start Command:** `npm start`  
**Runtime:** Node.js  
**Region:** Oregon  
**Plan:** Starter  
**Auto Deploy:** Enabled (deploys on commit to main branch)

## 📝 Important Notes

1. **Branch Name:** The repository uses `main` branch, but Render might be configured for `master`. Update Render settings to use `main` branch.

2. **Environment Variables:** Make sure all environment variables are set in Render dashboard, especially:
   - `AUTH_TOKEN`
   - `REFRESH_TOKEN`

3. **First Deployment:** The first deployment may take a few minutes as it installs dependencies and builds the project.

4. **Subsequent Deployments:** After the initial setup, any push to the `main` branch will automatically trigger a new deployment.

## 🐛 Troubleshooting

### If deployment fails:

1. Check the build logs in Render dashboard
2. Verify all environment variables are set
3. Ensure `package.json` has correct build/start scripts
4. Check that TypeScript compiles successfully (`npm run build`)

### If health check fails:

1. Verify PORT environment variable is set
2. Check server logs for errors
3. Ensure AUTH_TOKEN is valid

### If repository URL update doesn't work:

1. Try disconnecting and reconnecting the repository
2. Make sure you have access to the GitHub repository
3. Verify the repository URL is correct

## 📞 Quick Links

- **GitHub Repo:** https://github.com/rawrjustin/chat-beta-proxy
- **Render Dashboard:** https://dashboard.render.com/web/srv-d45d78p5pdvs73bvdr8g
- **Service URL:** https://chat-proxy-qbmj.onrender.com

