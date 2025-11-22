# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Set Up Supabase (2 minutes)

1. Go to https://supabase.com and sign up
2. Click **"New Project"**
3. Choose:
   - Organization: Your name
   - Project name: `job-tracker`
   - Database password: (generate strong password)
   - Region: Choose closest to you
4. Wait for project to initialize (~30 seconds)

### Step 2: Create Database Tables (1 minute)

1. In your Supabase project, click **"SQL Editor"** in left sidebar
2. Click **"New Query"**
3. Open `supabase-schema.sql` in this project
4. Copy ALL the contents
5. Paste into Supabase SQL Editor
6. Click **"Run"** button (▶️)
7. You should see "Success. No rows returned"

### Step 3: Get API Credentials (1 minute)

1. In Supabase, click **"Settings"** (gear icon) in sidebar
2. Click **"API"**
3. Find and copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### Step 4: Configure Your App (30 seconds)

1. Open `.env.local` file in this project
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 5: Start the App (30 seconds)

In your terminal:

```bash
npm run dev
```

Open http://localhost:3000 in your browser!

---

## 📝 Adding Your First Job Site

1. Click **"Add Site"** button
2. Fill in the form. Here's an example:

**Example: Y Combinator Jobs**
- **Site Name**: `Y Combinator`
- **URL**: `https://www.ycombinator.com/companies`  
- **CSS Selector**: `._company_86jzd_338`

3. Click **"Add Site"**
4. Click **"Scrape"** on the new site card
5. Wait a few seconds - jobs should appear!

---

## 🔍 Finding CSS Selectors

Don't worry, it's easier than it sounds!

1. Open the career page in Chrome/Edge
2. Right-click on a job listing → **"Inspect"**
3. In the DevTools, look for the HTML element that wraps each job
4. Look for a `class` attribute like:
   ```html
   <div class="job-listing">...</div>
   ```
5. The selector is: `.job-listing`

**Common selectors:**
- `.job-card`
- `.career-opportunity`
- `div[class*="job"]`
- `article.listing`

**Tip**: Try hovering over elements in DevTools - they highlight on the page!

---

## 🎉 You're Done!

Your job tracker is now running. It will:
- ✅ Display all tracked sites
- ✅ Show discovered jobs
- ✅ Highlight new jobs
- ✅ Let you scrape manually

### What's Next?

- Add more sites (as many as you want!)
- Deploy to Vercel for free hosting
- Set up automatic scraping every 6 hours

See `README.md` for deployment instructions.

---

## ❓ Troubleshooting

**"No jobs found"**
- Check if the URL is correct
- Try a different CSS selector
- Some sites use JavaScript - inspect carefully

**"Error connecting to database"**
- Verify .env.local has correct credentials
- Make sure you ran the SQL schema
- Check Supabase project is not paused

**"npm run dev won't start"**
- Make sure Node.js is installed
- Try closing and reopening terminal
- Run `npm install` again

Need help? Check the full README.md!
