import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { scrapeJobSite, generateJobHash } from '@/lib/scraper';

// POST /api/scrape - Trigger scraping for all active sites or a specific site
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { siteId } = body;

    // Get sites to scrape
    let query = supabase
      .from('sites')
      .select('*')
      .eq('is_active', true);

    if (siteId) {
      query = query.eq('id', siteId);
    }

    const { data: sites, error: sitesError } = await query;

    if (sitesError) throw sitesError;

    if (!sites || sites.length === 0) {
      return NextResponse.json(
        { error: 'No active sites found' },
        { status: 404 }
      );
    }

    const results = [];

    // Scrape each site
    for (const site of sites) {
      const logId = crypto.randomUUID();
      const startTime = new Date().toISOString();

      try {
        // Insert scrape log
        await supabase.from('scrape_logs').insert([
          {
            id: logId,
            site_id: site.id,
            status: 'running',
            started_at: startTime,
          },
        ]);

        // Scrape the site
        const scrapeResult = await scrapeJobSite(site.url, site.selector);

        if (scrapeResult.error) {
          throw new Error(scrapeResult.error);
        }

        // Get existing job hashes for this site
        const { data: existingJobs } = await supabase
          .from('jobs')
          .select('job_hash')
          .eq('site_id', site.id);

        const existingHashes = new Set(
          existingJobs?.map((j) => j.job_hash) || []
        );

        // Filter for new jobs
        const newJobs = scrapeResult.jobs.filter((job) => {
          const hash = generateJobHash(job.url);
          return !existingHashes.has(hash);
        });

        // Insert new jobs
        if (newJobs.length > 0) {
          const jobsToInsert = newJobs.map((job) => ({
            site_id: site.id,
            title: job.title,
            url: job.url,
            company: job.company,
            location: job.location,
            description: job.description,
            job_hash: generateJobHash(job.url),
            is_new: true,
          }));

          await supabase.from('jobs').insert(jobsToInsert);
        }

        // Update scrape log
        await supabase
          .from('scrape_logs')
          .update({
            status: 'success',
            jobs_found: scrapeResult.jobs.length,
            new_jobs: newJobs.length,
            completed_at: new Date().toISOString(),
          })
          .eq('id', logId);

        results.push({
          site: site.name,
          success: true,
          jobsFound: scrapeResult.jobs.length,
          newJobs: newJobs.length,
        });
      } catch (error: any) {
        // Update scrape log with error
        await supabase
          .from('scrape_logs')
          .update({
            status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString(),
          })
          .eq('id', logId);

        results.push({
          site: site.name,
          success: false,
          error: error.message,
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Scraping failed' },
      { status: 500 }
    );
  }
}

// GET /api/scrape/logs - Get scrape logs
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('scrape_logs')
      .select('*, sites(name)')
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ logs: data || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
