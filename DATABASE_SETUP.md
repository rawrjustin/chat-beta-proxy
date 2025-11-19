# Database Setup for Password Protection

This guide explains how to set up a PostgreSQL database on Railway to persist character passwords across deployments.

## Why a Database?

Character passwords need to persist across:
- Server restarts
- Deployments
- Multiple server instances

Railway's filesystem is **ephemeral** (wiped on each deployment), so we use a PostgreSQL database for persistent storage.

## Step 1: Connect PostgreSQL Service (Already Exists!)

✅ **Good news!** A PostgreSQL service already exists in your Railway project.

### Connect the Database to Your Service

1. Go to your Railway project: https://railway.com/project/4abe18cb-0ce5-4916-9126-e399916cd82e
2. Click on the **Postgres** service
3. Go to the **"Variables"** tab
4. Find the **`DATABASE_URL`** variable (it should be there automatically)
5. Copy the value
6. Go to your **`graceful-exploration`** (chat-beta-proxy) service
7. Go to **"Variables"** tab
8. Click **"+ New Variable"**
9. Add:
   - **Name:** `DATABASE_URL`
   - **Value:** (paste the DATABASE_URL from Postgres service)
10. Click **"Add"**

**Alternative:** Railway should automatically share variables between connected services. If the services are connected in the same project, `DATABASE_URL` should be available automatically. Check if it's already there!

### If PostgreSQL Service Doesn't Exist

If you don't see a Postgres service:

1. Click **"+ New"** button in Railway dashboard
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically create it and set `DATABASE_URL`

## Step 2: Verify Database Connection

After adding PostgreSQL, Railway automatically:
- Creates the database
- Sets `DATABASE_URL` environment variable (available to all services in the project)
- Makes it accessible to your service

The `DATABASE_URL` will look like:
```
postgresql://postgres:password@hostname.railway.app:5432/railway
```

**Note:** Railway automatically shares `DATABASE_URL` between services in the same project. If you don't see it:
1. Check that both services are in the same Railway project
2. The variable might be available at runtime even if not visible in the dashboard
3. After deploying, check the logs - if database initializes, `DATABASE_URL` is working!

## Step 3: Deploy Your Code

Once the database is added:

1. **Push your code** (if not auto-deploying):
   ```bash
   git add .
   git commit -m "Add database support for password persistence"
   git push
   ```

2. **Railway will automatically**:
   - Deploy the new code
   - Initialize the database schema on startup
   - Create the `character_passwords` table

## Step 4: Verify Database Schema

After deployment, check the logs to see:
```
[Database] Connection pool created
[Database] Schema initialized successfully
✅ Database initialized successfully
```

If you see these messages, the database is working!

## Database Schema

The following table is created automatically:

```sql
CREATE TABLE character_passwords (
  config_id VARCHAR(255) PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  hint TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

## Testing

1. **Set a password** via admin API:
   ```bash
   curl -X PUT "https://chat-beta-proxy-production.up.railway.app/admin/api/characters/CHAR_195be96c-e510-41b9-ae13-ad08514a6086/password?password=genies" \
     -H "Content-Type: application/json" \
     -d '{"password": "test123", "hint": "Test hint"}'
   ```

2. **Verify it persists**:
   - Check the character config endpoint
   - Should show `password_required: true`
   - Deploy a new version
   - Password should still be there!

## Troubleshooting

### "DATABASE_URL not set"
- Make sure you added a PostgreSQL service in Railway
- Check that the service is connected to your `chat-beta-proxy` service
- Verify in Railway dashboard → Variables tab

### "Database initialization failed"
- Check Railway logs for connection errors
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL service is running

### Passwords still disappearing
- Verify database is connected (check logs)
- Check that `DATABASE_URL` is set in Railway
- Ensure database service is not paused

## Local Development

For local development, you can:

1. **Use a local PostgreSQL database**:
   ```bash
   # Set DATABASE_URL in .env
   DATABASE_URL=postgresql://user:password@localhost:5432/chat_proxy
   ```

2. **Or use Railway's database** (for testing):
   - Copy `DATABASE_URL` from Railway dashboard
   - Add to your local `.env` file

## Security Notes

- Passwords are **hashed** using SHA-256 before storage
- Only password hashes are stored, never plain text
- Database connection uses SSL on Railway
- Access tokens remain in-memory (short-lived, don't persist)

## Next Steps

Once the database is set up:
1. ✅ Passwords will persist across deployments
2. ✅ Multiple server instances can share the same passwords
3. ✅ Admin can manage passwords via API
4. ✅ Users must authenticate per device/browser

---

**Need Help?** Check Railway logs or contact support.

