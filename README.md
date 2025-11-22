# Job Tracker

A modern job scraping and tracking application built with Next.js 14, Supabase, and Vercel. Track job postings from multiple career sites automatically and get notified of new opportunities.

## Features

- 🔍 **Automatic Scraping**: Scrape multiple career sites on a schedule
- 📊 **Beautiful Dashboard**: Modern UI built with Tailwind CSS
- 🔔 **New Job Alerts**: Highlight newly discovered jobs
- ⚡ **Fast & Free**: Hosted on Vercel with Supabase database
- 🤖 **Automated**: Vercel Cron Jobs run scraping every 6 hours
- ➕ **Easy to Extend**: Add new sites with a simple form

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Scraping**: Cheerio, Axios
- **Hosting**: Vercel
- **Automation**: Vercel Cron Jobs

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings** → **API** and copy:
   - `Project URL`
   - `anon/public` key

### 2. Set Up Database

1. In your Supabase project, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql`
3. Paste and run it in the SQL Editor
4. This creates the `sites`, `jobs`, and `scrape_logs` tables

### 3. Configure Environment Variables

1. Create a `.env.local` file in the project root (already exists)
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 6. Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

Vercel will automatically set up the cron job defined in `vercel.json` to scrape sites every 6 hours.

## Usage

### Adding a New Site

1. Click **"Add Site"** button
2. Enter:
   - **Site Name**: e.g., "Google Careers"
   - **Career Page URL**: Full URL to the jobs page
   - **CSS Selector**: Inspect the page and find the selector for job listings
     - Examples: `.job-listing`, `div.job-item`, `.career-card`
3. Click **"Add Site"**

### Finding CSS Selectors

1. Open the career page in your browser
2. Right-click on a job listing → **Inspect**
3. Find the common class or element that wraps each job
4. Use that as your selector (e.g., `.job-card`, `div[class*="job"]`)

### Scraping

- **Manual**: Click "Scrape All" or "Scrape" on individual sites
- **Automatic**: Vercel Cron runs every 6 hours (customizable in `vercel.json`)

### Viewing Jobs

- All jobs are displayed on the dashboard
- Click **"New Only"** to filter for recently discovered jobs
- Click the external link icon to open job posting
- Click the eye icon to mark a job as "seen"

## Project Structure

```
job-tracker/
├── app/
│   ├── api/
│   │   ├── sites/route.ts      # CRUD for sites
│   │   ├── jobs/route.ts       # Get jobs, mark as seen
│   │   └── scrape/route.ts     # Scraping logic
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Main dashboard
├── lib/
│   ├── scraper.ts             # Web scraping functions
│   ├── supabase.ts            # Database client & types
│   └── utils.ts               # Helper functions
├── supabase-schema.sql        # Database schema
├── vercel.json                # Cron configuration
└── .env.local                 # Environment variables
```

## Customization

### Change Scraping Schedule

Edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/scrape",
      "schedule": "0 */6 * * *"  // Every 6 hours
    }
  ]
}
```

Cron format: `minute hour day month dayOfWeek`
- Every 12 hours: `0 */12 * * *`
- Daily at 9 AM: `0 9 * * *`
- Every hour: `0 * * * *`

### Add More Site Information

Extend the scraper in `lib/scraper.ts` to extract additional fields like:
- Salary
- Job type (remote, hybrid, onsite)
- Experience level
- Tags/skills

Update the database schema and UI accordingly.

## Troubleshooting

### Scraping Fails

- **Check selector**: Inspect the page and verify the CSS selector is correct
- **CORS issues**: Some sites block requests from servers (use Puppeteer/Playwright)
- **Rate limiting**: Add delays between requests
- **Dynamic content**: Sites using JavaScript may need browser automation

### No Jobs Found

- Verify the career page URL is correct
- Check if the page structure has changed
- Try a broader CSS selector (e.g., `div`, `article`)

### Database Errors

- Verify Supabase credentials in `.env.local`
- Check if the database schema was created correctly
- Look at Supabase logs for error messages

## Free Tier Limits

- **Vercel**: 100GB bandwidth, 6000 build minutes/month
- **Supabase**: 500MB database, unlimited API requests
- **Vercel Cron**: Included for free

This should be more than enough for tracking 20-30 job sites!

## License

MIT

## Contributing

Feel free to open issues or submit PRs!

---

Built with ❤️ using Next.js and Supabase
