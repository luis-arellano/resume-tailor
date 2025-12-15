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

// Get specific tailored resume
export async function GET(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    // Fetch the tailored resume with related data
    const { data, error } = await supabase
      .from('tailored_resumes')
      .select(`
        *,
        resumes:master_resume_id(id, file_name, resume_data),
        job_scans:job_scan_id(id, job_description, company, job_title, keywords)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching tailored resume:', error);
      return errorResponse('Tailored resume not found', 404);
    }

    return successResponse(data);
  } catch (error) {
    console.error('Error in GET tailored resume:', error);
    return errorResponse('Internal server error', 500);
  }
}

// Update tailored resume
export async function PUT(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    // Get the request body
    const { resume_data, status } = await request.json();

    // Validate input
    if (!resume_data && !status) {
      return errorResponse('Must provide resume_data or status to update', 400);
    }

    // Build update object
    const updateData = {};
    if (resume_data) updateData.resume_data = resume_data;
    if (status) updateData.status = status;

    // Update the tailored resume
    const { data, error } = await supabase
      .from('tailored_resumes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        resumes:master_resume_id(id, file_name),
        job_scans:job_scan_id(id, job_description, company, job_title)
      `)
      .single();

    if (error) {
      console.error('Error updating tailored resume:', error);
      return errorResponse('Failed to update tailored resume', 500);
    }

    if (!data) {
      return errorResponse('Tailored resume not found or access denied', 404);
    }

    return successResponse(data);
  } catch (error) {
    console.error('Error in PUT tailored resume:', error);
    return errorResponse('Internal server error', 500);
  }
}

// Delete tailored resume
export async function DELETE(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    // Delete the tailored resume
    const { error } = await supabase
      .from('tailored_resumes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting tailored resume:', error);
      return errorResponse('Failed to delete tailored resume', 500);
    }

    return successResponse({ id, message: 'Tailored resume deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE tailored resume:', error);
    return errorResponse('Internal server error', 500);
  }
}