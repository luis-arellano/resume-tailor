import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Helper function for error responses
const errorResponse = (message, status = 400) => {
  return NextResponse.json(
    { 
      error: {
        message,
        status
      }
    },
    { status }
  );
};

// Helper function for success responses
const successResponse = (data, meta = {}) => {
  return NextResponse.json(
    { 
      data,
      meta
    },
    { status: 200 }
  );
};

// Get all tailored resumes for the current user
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const master_resume_id = searchParams.get('master_resume_id');
    const job_scan_id = searchParams.get('job_scan_id');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');
    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from('tailored_resumes')
      .select(`
        *,
        resumes:master_resume_id(id, file_name),
        job_scans:job_scan_id(id, job_description, company, job_title)
      `, { count: 'exact' })
      .eq('user_id', user.id);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (master_resume_id) {
      query = query.eq('master_resume_id', master_resume_id);
    }
    if (job_scan_id) {
      query = query.eq('job_scan_id', job_scan_id);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching tailored resumes:', error);
      return errorResponse('Failed to fetch tailored resumes', 500);
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);
    const meta = {
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };

    return successResponse(data, meta);
  } catch (error) {
    console.error('Error in GET tailored resumes:', error);
    return errorResponse('Internal server error', 500);
  }
}

// Create a new tailored resume
export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    // Get the request body
    const { master_resume_id, job_scan_id, resume_data, status = 'draft' } = await request.json();

    // Validate required fields
    if (!master_resume_id || !job_scan_id || !resume_data) {
      return errorResponse('Missing required fields: master_resume_id, job_scan_id, resume_data', 400);
    }

    // Verify the master resume belongs to the user
    const { data: masterResume, error: masterError } = await supabase
      .from('resumes')
      .select('id')
      .eq('id', master_resume_id)
      .eq('user_id', user.id)
      .single();

    if (masterError || !masterResume) {
      return errorResponse('Master resume not found or access denied', 404);
    }

    // Verify the job scan belongs to the user
    const { data: jobScan, error: jobError } = await supabase
      .from('job_scans')
      .select('id')
      .eq('id', job_scan_id)
      .eq('user_id', user.id)
      .single();

    if (jobError || !jobScan) {
      return errorResponse('Job scan not found or access denied', 404);
    }

    // Create the tailored resume
    const { data, error } = await supabase
      .from('tailored_resumes')
      .insert({
        user_id: user.id,
        master_resume_id,
        job_scan_id,
        resume_data,
        status
      })
      .select(`
        *,
        resumes:master_resume_id(id, file_name),
        job_scans:job_scan_id(id, job_description, company, job_title)
      `)
      .single();

    if (error) {
      console.error('Error creating tailored resume:', error);
      return errorResponse('Failed to create tailored resume', 500);
    }

    return successResponse(data);
  } catch (error) {
    console.error('Error in POST tailored resume:', error);
    return errorResponse('Internal server error', 500);
  }
}