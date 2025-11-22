import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';

export interface ScrapeResult {
  jobs: {
    title: string;
    url: string;
    company?: string;
    location?: string;
    description?: string;
  }[];
  error?: string;
}

/**
 * Scrape a career site for job listings
 * @param url The URL of the career page
 * @param selector CSS selector for job listing elements (can be comma-separated for multiple)
 * @returns Array of job postings found
 */
export async function scrapeJobSite(
  url: string,
  selector: string
): Promise<ScrapeResult> {
  try {
    // Fetch the HTML content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 15000, // 15 second timeout
    });

    const $ = cheerio.load(response.data);
    const jobs: ScrapeResult['jobs'] = [];

    // Split selector by comma to support multiple selectors
    const selectors = selector.split(',').map(s => s.trim());

    // Find all job listings using each selector
    selectors.forEach(sel => {
      $(sel).each((_, element) => {
        const $elem = $(element);
        
        // Try to extract job information (flexible selectors)
        const title = 
          $elem.find('h2, h3, .title, [class*="title"]').first().text().trim() ||
          $elem.find('a').first().text().trim();
        
        const link = 
          $elem.find('a').first().attr('href') || 
          $elem.attr('href') || '';
        
        const company = 
          $elem.find('.company, [class*="company"]').first().text().trim();
        
        const location = 
          $elem.find('.location, [class*="location"]').first().text().trim();
        
        const description = 
          $elem.find('.description, [class*="description"]').first().text().trim();

        // Resolve relative URLs
        let jobUrl = link;
        if (link && !link.startsWith('http')) {
          const baseUrl = new URL(url);
          jobUrl = new URL(link, baseUrl.origin).toString();
        }

        if (title && jobUrl) {
          jobs.push({
            title,
            url: jobUrl,
            company: company || undefined,
            location: location || undefined,
            description: description || undefined,
          });
        }
      });
    });

    return { jobs };
  } catch (error: any) {
    console.error('Scraping error:', error.message);
    return {
      jobs: [],
      error: error.message || 'Failed to scrape site',
    };
  }
}

/**
 * Generate a hash for deduplication
 */
export function generateJobHash(url: string): string {
  return crypto.createHash('md5').update(url).digest('hex');
}

/**
 * Check if a job already exists in the database
 */
export function isJobNew(existingHashes: Set<string>, jobUrl: string): boolean {
  const hash = generateJobHash(jobUrl);
  return !existingHashes.has(hash);
}
