import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/jobs - Get all jobs or filter by site
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const onlyNew = searchParams.get('onlyNew') === 'true';

    let query = supabase
      .from('jobs')
      .select('*, sites(name)')
      .order('discovered_at', { ascending: false });

    if (siteId) {
      query = query.eq('site_id', siteId);
    }

    if (onlyNew) {
      query = query.eq('is_new', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ jobs: data || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

// PATCH /api/jobs?id=xxx - Mark job as seen
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing job id' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('jobs')
      .update({ is_new: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ job: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update job' },
      { status: 500 }
    );
  }
}

// POST /api/jobs/mark-all-seen - Mark all jobs as seen
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { siteId } = body;

    let query = supabase
      .from('jobs')
      .update({ is_new: false })
      .eq('is_new', true);

    if (siteId) {
      query = query.eq('site_id', siteId);
    }

    const { error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to mark jobs as seen' },
      { status: 500 }
    );
  }
}
