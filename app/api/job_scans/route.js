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
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');
    const resume_id = searchParams.get('resume_id');
    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from('job_scans')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Apply filters
    if (status) {
      query = query.eq('application_status', status);
    }

    // apply resume_id filter
    if (resume_id) {
      query = query.eq('resume_id', resume_id);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching job scans:', error);
      return errorResponse('Failed to fetch job scans', 500);
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
    console.error('Error in GET job scans:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    // Get the request body
    // const jobScan = await request.json();
    const {resume, job_description, resume_id} = await request.json();

    if (!resume || !job_description || !resume_id) {
      return errorResponse('Missing required fields', 400);
    }

    // Add user_id and timestamps
    const newJobScan = {
      user_id: user.id,
      resume_id: resume_id,
      job_description: job_description,
      status: 'processing',
    };

    // Create the job scan
    const { data, error } = await supabase
      .from('job_scans')
      .insert(newJobScan)
      .select()
      .single();

    if (error) {
      console.error('Error creating job scan:', error);
      return errorResponse('Failed to create job scan', 500);
    }

    // Trigger Cloud Run Evaluation

    const cloud_run_url = 'https://magic-resume-backend-110102002651.us-central1.run.app';
    const response = await fetch(`${cloud_run_url}/evaluate_resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.GOOGLE_CLOUD_API_KEY
      },
      body: JSON.stringify({
        job_scan_id: data.id,
        resume: JSON.stringify(resume),
        job_description: job_description,
        resume_id: resume_id,
        user_id: user.id
      })
    });
    console.log('Cloud Run request sent:', {
      url: `${cloud_run_url}/evaluate_resume`,
      jobScanId: data.id,
      responseStatus: response.status
    });

    if (!response.ok) {
      throw new Error(`Cloud Run request failed with status ${response.status}`);
    }

    return successResponse(data);
  } catch (error) {
    console.error('Error in POST job scan:', error);
    return errorResponse('Internal server error', 500);
  }
} 