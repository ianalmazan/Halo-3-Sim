# Deploying Halo 3 Game Simulator to Supabase + Vercel

This guide documents the complete deployment process for the Halo 3 Game Simulator app using GitHub, Supabase (PostgreSQL database), and Vercel (Next.js hosting).

## Prerequisites

- GitHub account
- Supabase account (free tier works)
- Vercel account (free tier works)
- Node.js 18+ installed locally
- Git installed locally

## Deployment Order

**Important:** Follow these steps in order.

1. Push code to GitHub
2. Set up Supabase database
3. Run SQL setup in Supabase
4. Deploy to Vercel with connection string

---

## Step 1: Initial GitHub Setup

### First-Time Project Push

If you haven't pushed your project to GitHub yet:

1. **Create a new repository on GitHub:**
   - Go to [github.com](https://github.com) and sign in
   - Click the **"+"** icon → **"New repository"**
   - Name your repository (e.g., "Halo-3-Sim")
   - Keep it Public or Private (your choice)
   - **Do NOT** initialize with README, .gitignore, or license
   - Click **"Create repository"**

2. **Initialize git and push from your local project:**

   ```bash
   # Navigate to your project folder
   cd path/to/halo3-game-sim

   # Initialize git repository
   git init
   git branch -M main

   # Add all files
   git add .

   # Create initial commit
   git commit -m "Initial commit"

   # Add GitHub as remote origin (replace with your repo URL)
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

   # Push to GitHub
   git push -u origin main
   ```

3. **Verify:** Go to your GitHub repository URL and confirm all files are there

### Pushing Updates

After making code changes:

```bash
# Check what files changed
git status

# Add changed files (or specific files)
git add .

# Commit with a descriptive message
git commit -m "Description of what you changed"

# Push to GitHub
git push origin main
```

Vercel will automatically redeploy when changes are pushed to the main branch.

### Common Git Commands

```bash
# Check current status
git status

# View commit history
git log --oneline

# Discard changes to a file
git checkout -- filename

# Pull latest changes (if working from multiple machines)
git pull origin main
```

---

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up or log in
2. Click **"New Project"**
3. Configure your project:
   - **Name:** Choose a name (e.g., "halo3-sim")
   - **Database Password:** Set a strong password and **save it somewhere safe** - you'll need it later
   - **Region:** Select a region close to you (or your users)
4. Click **"Create new project"**
5. Wait approximately 2 minutes for the project to be provisioned

---

## Step 3: Run the Database Setup SQL

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

## Step 4: Get the Database Connection String

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

## Step 5: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **"Add New Project"**
3. Find and import your repository from the list
4. **Before clicking Deploy**, expand **"Environment Variables"**
5. Add the environment variable:
   - **Name:** `DATABASE_URL`
   - **Value:** Your Supabase connection string (from Step 4)
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

### Issue: "fatal: remote origin already exists"

**Cause:** You already have a remote origin set.

**Solution:**
```bash
# Remove existing origin
git remote remove origin

# Add new origin
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
```

---

### Issue: "error: failed to push some refs"

**Cause:** Remote has changes you don't have locally.

**Solution:**
```bash
# Pull and merge remote changes first
git pull origin main --rebase

# Then push
git push origin main
```

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase PostgreSQL connection string (Transaction pooler) | `postgresql://postgres.xxx:pass@aws-0-us-east-1.pooler.supabase.com:6543/postgres` |

---

## Updating Your Deployment

### Code Changes

1. Make your code changes locally
2. Test locally if needed: `npm run dev`
3. Push to GitHub:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
4. Vercel automatically redeploys (takes ~1-2 minutes)

### Database Schema Changes

If you need to modify the database schema:

1. Write your SQL migration
2. Run it in Supabase SQL Editor
3. Update `supabase-setup.sql` for future deployments
4. Redeploy to Vercel if any code changes were needed

### Environment Variable Changes

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Edit or add variables
3. Redeploy: Go to Deployments → click "..." on latest → Redeploy

---

## Useful Links

- **Supabase Dashboard:** [app.supabase.com](https://app.supabase.com)
- **Vercel Dashboard:** [vercel.com/dashboard](https://vercel.com/dashboard)
- **GitHub:** [github.com](https://github.com)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
