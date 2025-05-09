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

export async function GET(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    // Fetch the job scan
    const { data, error } = await supabase
      .from('job_scans')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching job scan:', error);
      return errorResponse('Job scan not found', 404);
    }

    return successResponse(data);
  } catch (error) {
    console.error('Error in GET job scan:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PATCH(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    // Get the request body
    const updates = await request.json();
    console.log("updates", updates);
    console.log("id", id);

    
    
    if (!updates || Object.keys(updates).length === 0) {
      return errorResponse('No updates provided', 400);
    }

    // First verify the record exists and belongs to the user
    const { data: existingScan, error: fetchError } = await supabase
      .from('job_scans')
      .select('*')  // Select all fields to see current state
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    console.log("Existing scan:", {
      scan: existingScan,
      error: fetchError,
      id,
      user_id: user.id
    });

    if (fetchError || !existingScan) {
      console.error('Record not found or unauthorized:', { fetchError, existingScan });
      return errorResponse('Job scan not found or unauthorized', 404);
    }

    // Try a simpler update approach with explicit logging
    console.log("Attempting update with data:", {
      id,
      user_id: user.id,
      updates,
      existingStatus: existingScan.application_status
    });

    const { data, error } = await supabase
      .from('job_scans')
      .update({ application_status: updates.application_status })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*');

    console.log("Update response:", {
      data,
      error,
      updateCount: data?.length
    });

    if (error) {
      console.error('Error updating job scan:', error);
      return errorResponse('Failed to update job scan', 500);
    }

    // Fetch the updated record to verify changes
    const { data: updatedScan, error: verifyError } = await supabase
      .from('job_scans')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    console.log("Verification after update:", {
      updatedScan,
      error: verifyError,
      newStatus: updatedScan?.application_status,
      oldStatus: existingScan.application_status
    });

    if (verifyError) {
      console.error('Error verifying update:', verifyError);
      return errorResponse('Failed to verify update', 500);
    }

    return successResponse(updatedScan);
  } catch (error) {
    console.error('Error in PATCH job scan:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    // Delete the job scan
    const { error } = await supabase
      .from('job_scans')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting job scan:', error);
      return errorResponse('Failed to delete job scan', 500);
    }

    return successResponse({ id });
  } catch (error) {
    console.error('Error in DELETE job scan:', error);
    return errorResponse('Internal server error', 500);
  }
} 