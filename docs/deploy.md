# Deploying Halo 3 Game Simulator to Supabase + Vercel

This guide documents the complete deployment process for the Halo 3 Game Simulator app using Supabase (PostgreSQL database) and Vercel (Next.js hosting).

## Prerequisites

- GitHub account
- Supabase account (free tier works)
- Vercel account (free tier works)
- Code pushed to a GitHub repository

## Deployment Order

**Important:** Follow these steps in order. The database must be fully set up before deploying to Vercel.

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up or log in
2. Click **"New Project"**
3. Configure your project:
   - **Name:** Choose a name (e.g., "halo3-sim")
   - **Database Password:** Set a strong password and **save it somewhere safe** - you'll need it later
   - **Region:** Select a region close to you (or your users)
4. Click **"Create new project"**
5. Wait approximately 2 minutes for the project to be provisioned

---

## Step 2: Run the Database Setup SQL

This step creates all tables, functions, triggers, views, and seed data.

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase-setup.sql` from your project's root folder
4. **Copy the entire contents** of the file
5. Paste it into the Supabase SQL Editor
6. Click **"Run"**

You should see multiple success messages as it creates:
- 13 tables
- 10 functions
- 7 triggers
- 10 views
- Seed data (teams, maps, weapons, achievements, sample users)

### Verifying the Setup

Run this query to verify the views were created:

```sql
SELECT * FROM vw_recent_games LIMIT 1;
```

If this returns an error, re-run the views section from `supabase-setup.sql`.

---

## Step 3: Get the Database Connection String

**Important:** Use the Transaction Pooler connection for Vercel deployments.

1. In Supabase, go to **Settings** (gear icon in sidebar)
2. Click **"Database"**
3. Scroll down to the **"Connection string"** section
4. Click the **"URI"** tab
5. **Important:** Select **"Transaction"** pooler mode (not "Session")
   - The URL should contain `pooler.supabase.com:6543`
6. Copy the connection string
7. Replace `[YOUR-PASSWORD]` with your actual database password

Your connection string should look like:
```
postgresql://postgres.xxxxxxxxxxxx:YourPassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **"Add New Project"**
3. Find and import your repository from the list
4. **Before clicking Deploy**, expand **"Environment Variables"**
5. Add the environment variable:
   - **Name:** `DATABASE_URL`
   - **Value:** Your Supabase connection string (from Step 3)
6. Click **"Deploy"**
7. Wait 1-2 minutes for the build to complete

Once deployed, you'll receive a URL like `https://your-app.vercel.app`

---

## Troubleshooting

### Issue: "Application error: a client-side exception has occurred"

**Cause:** Database connection or missing tables/views.

**Solution:**
1. Check Vercel logs: Go to your Vercel project → Deployments → click latest → Logs
2. Look for specific error messages about failed queries

---

### Issue: "Error fetching games: Failed query: SELECT * FROM vw_recent_games"

**Cause:** Database views were not created, or wrong connection string.

**Solutions:**

1. **Verify views exist** - Run in Supabase SQL Editor:
   ```sql
   SELECT * FROM vw_recent_games LIMIT 1;
   ```

2. **Re-run views creation** - If views are missing, run the views section from `supabase-setup.sql` (scroll to `-- VIEWS` section)

3. **Check connection string** - Make sure you're using the **Transaction pooler** mode (port 6543), not Session mode

---

### Issue: Connection timeout or "password authentication failed"

**Cause:** Wrong connection string format or incorrect password.

**Solutions:**

1. **Use Transaction Pooler:** In Supabase → Settings → Database → Connection string, select "Transaction" mode
2. **Verify password:** Make sure you replaced `[YOUR-PASSWORD]` with your actual database password
3. **Check for special characters:** If your password has special characters, they may need to be URL-encoded

---

### Issue: Tables exist but views don't

**Cause:** The SQL script may have partially executed.

**Solution:** Run just the views portion of `supabase-setup.sql`:
1. Open `supabase-setup.sql`
2. Find the section starting with `-- VIEWS`
3. Copy from there to the end of the file
4. Paste and run in Supabase SQL Editor

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase PostgreSQL connection string (Transaction pooler) | `postgresql://postgres.xxx:pass@aws-0-us-east-1.pooler.supabase.com:6543/postgres` |

---

## Updating the Deployment

After making code changes:

1. Push changes to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. Vercel will automatically redeploy when it detects changes to the main branch

---

## Database Schema Changes

If you need to modify the database schema:

1. Write your SQL migration
2. Run it in Supabase SQL Editor
3. Update `supabase-setup.sql` for future deployments
4. Redeploy to Vercel if any code changes were needed

---

## Useful Links

- **Supabase Dashboard:** [app.supabase.com](https://app.supabase.com)
- **Vercel Dashboard:** [vercel.com/dashboard](https://vercel.com/dashboard)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
