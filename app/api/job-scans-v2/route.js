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

/**
 * NEW WORKFLOW: Enhanced job scan creation with tailored resume
 * 
 * This endpoint implements the new master-resume → tailored-resume workflow:
 * 1. Validates master resume exists and belongs to user
 * 2. Creates job_scan record (for AI analysis)
 * 3. Creates tailored_resume (copy of master that can be modified)
 * 4. Triggers Cloud Run AI analysis (keywords, feedback, job info)
 * 
 * The Cloud Run will analyze and update the job_scan with:
 * - keywords: extracted keywords from job description
 * - job_analysis: AI feedback on resume vs job match
 * - job_title: parsed job title
 * - company: parsed company name
 * - status: 'completed' or 'error'
 * 
 * The tailored_resume starts as an exact copy of master_resume_data
 * and can be edited independently without affecting the original.
 */
export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    // Get the request body
    const { resume, job_description, resume_id } = await request.json();

    if (!resume || !job_description || !resume_id) {
      return errorResponse('Missing required fields: resume, job_description, resume_id', 400);
    }

    // STEP 1: Verify the master resume exists and belongs to the user
    // This ensures we have a valid master resume to create tailored version from
    const { data: masterResume, error: resumeError } = await supabase
      .from('resumes')
      .select('id, resume_data, file_name')
      .eq('id', resume_id)
      .eq('user_id', user.id)
      .single();

    if (resumeError || !masterResume) {
      console.error('Master resume not found:', { resume_id, user_id: user.id, error: resumeError });
      return errorResponse('Master resume not found or access denied', 404);
    }

    // STEP 2: Create the job scan record
    // This will store the AI analysis results (keywords, feedback, etc.)
    const newJobScan = {
      user_id: user.id,
      resume_id: resume_id, // References the master resume (for backward compatibility)
      job_description: job_description,
      status: 'processing', // Will be updated by Cloud Run to 'completed' or 'error'
    };

    const { data: jobScanData, error: jobScanError } = await supabase
      .from('job_scans')
      .insert(newJobScan)
      .select()
      .single();

    if (jobScanError) {
      console.error('Error creating job scan:', jobScanError);
      return errorResponse('Failed to create job scan', 500);
    }

    console.log('✅ Created job scan:', {
      jobScanId: jobScanData.id,
      masterResumeId: resume_id,
      userId: user.id
    });

    // STEP 3: Create initial tailored resume from master resume
    // This creates an editable copy that starts identical to the master
    // Users can edit this version without affecting the original master resume
    const { data: tailoredResumeData, error: tailoredError } = await supabase
      .from('tailored_resumes')
      .insert({
        user_id: user.id,
        master_resume_id: resume_id, // Reference to the master resume template
        job_scan_id: jobScanData.id, // Links this tailored version to the specific job
        resume_data: resume, // Start with exact copy of master resume data
        status: 'draft' // User can edit and eventually mark as 'final' or 'applied'
      })
      .select()
      .single();

    if (tailoredError) {
      console.error('Error creating tailored resume:', tailoredError);
      // Clean up: Remove the job scan if tailored resume creation fails
      await supabase.from('job_scans').delete().eq('id', jobScanData.id);
      return errorResponse('Failed to create tailored resume', 500);
    }

    console.log('✅ Created tailored resume:', {
      tailoredResumeId: tailoredResumeData.id,
      jobScanId: jobScanData.id,
      masterResumeId: resume_id
    });

    // STEP 4: Trigger Cloud Run AI Analysis
    // The Cloud Run will:
    // 1. Extract keywords from job_description
    // 2. Generate feedback comparing resume to job
    // 3. Parse job_title and company from job_description
    // 4. Update the job_scan record with results
    const cloud_run_url = 'https://magic-resume-backend-110102002651.us-central1.run.app';
    
    try {
      const response = await fetch(`${cloud_run_url}/evaluate_resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.GOOGLE_CLOUD_API_KEY
        },
        body: JSON.stringify({
          job_scan_id: jobScanData.id,
          tailored_resume_id: tailoredResumeData.id, // NEW: Pass tailored resume ID for future use
          resume: JSON.stringify(resume),
          job_description: job_description,
          resume_id: resume_id, // Master resume ID
          user_id: user.id
        })
      });

      console.log('🚀 Cloud Run request sent:', {
        url: `${cloud_run_url}/evaluate_resume`,
        jobScanId: jobScanData.id,
        tailoredResumeId: tailoredResumeData.id,
        responseStatus: response.status,
        responseOk: response.ok
      });

      if (!response.ok) {
        console.error(`⚠️ Cloud Run request failed with status ${response.status}`);
        // Don't fail the entire request - user can still access job scan and tailored resume
        // The status will remain 'processing' until Cloud Run succeeds
      }
    } catch (fetchError) {
      console.error('❌ Cloud Run request failed:', fetchError);
      // Don't fail the entire request - job scan and tailored resume are still created
    }

    // STEP 5: Return success response with both IDs
    // Frontend can use these to navigate to the tailored resume or track progress
    return successResponse({
      ...jobScanData,
      tailored_resume_id: tailoredResumeData.id, // NEW: Include tailored resume ID
      master_resume_id: resume_id // Include for clarity
    });

  } catch (error) {
    console.error('❌ Error in POST job scan v2:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * GET endpoint - Same functionality as original job_scans for backward compatibility
 * Could be enhanced to also return related tailored_resumes
 */
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

    // Build the query - enhanced to include tailored resume info
    let query = supabase
      .from('job_scans')
      .select(`
        *,
        tailored_resumes(id, status, created_at)
      `, { count: 'exact' })
      .eq('user_id', user.id);

    // Apply filters
    if (status) {
      query = query.eq('application_status', status);
    }
    if (resume_id) {
      query = query.eq('resume_id', resume_id);
    }

    // Apply sorting and pagination
    query = query
      .order(sort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching job scans v2:', error);
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
    console.error('Error in GET job scans v2:', error);
    return errorResponse('Internal server error', 500);
  }
}