import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/sites - Get all sites
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ sites: data || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sites' },
      { status: 500 }
    );
  }
}

// POST /api/sites - Add a new site
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, url, selector } = body;

    if (!name || !url || !selector) {
      return NextResponse.json(
        { error: 'Missing required fields: name, url, selector' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('sites')
      .insert([{ name, url, selector }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ site: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create site' },
      { status: 500 }
    );
  }
}

// DELETE /api/sites?id=xxx - Delete a site
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing site id' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete site' },
      { status: 500 }
    );
  }
}

// PATCH /api/sites?id=xxx - Update site status
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing site id' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('sites')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ site: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update site' },
      { status: 500 }
    );
  }
}
