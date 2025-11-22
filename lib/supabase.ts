import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types
export interface Site {
  id: string;
  name: string;
  url: string;
  selector: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  site_id: string;
  title: string;
  url: string;
  company?: string;
  location?: string;
  description?: string;
  job_hash: string;
  is_new: boolean;
  posted_date?: string;
  discovered_at: string;
  created_at: string;
}

export interface ScrapeLog {
  id: string;
  site_id: string;
  status: 'success' | 'failed' | 'partial';
  jobs_found: number;
  new_jobs: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}
