-- Job Tracker Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sites table: stores career pages to track
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL UNIQUE,
  selector TEXT NOT NULL, -- CSS selector for job listings
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Jobs table: stores discovered job postings
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  url TEXT NOT NULL,
  company VARCHAR(255),
  location VARCHAR(255),
  description TEXT,
  job_hash VARCHAR(64) NOT NULL UNIQUE, -- MD5/SHA256 of URL for deduplication
  is_new BOOLEAN DEFAULT true,
  posted_date TIMESTAMP,
  discovered_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scrape logs table: track scraping activity
CREATE TABLE scrape_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL, -- 'success', 'failed', 'partial'
  jobs_found INTEGER DEFAULT 0,
  new_jobs INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_jobs_site_id ON jobs(site_id);
CREATE INDEX idx_jobs_is_new ON jobs(is_new);
CREATE INDEX idx_jobs_discovered_at ON jobs(discovered_at DESC);
CREATE INDEX idx_scrape_logs_site_id ON scrape_logs(site_id);
CREATE INDEX idx_scrape_logs_started_at ON scrape_logs(started_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at for sites
CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some example sites (optional)
INSERT INTO sites (name, url, selector) VALUES
  ('Example Corp Careers', 'https://example.com/careers', '.job-listing'),
  ('Tech Startup Jobs', 'https://techstartup.com/jobs', 'div.job-item');
