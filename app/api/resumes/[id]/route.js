import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function PUT(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    // Parse the request body
    const body = await request.json();
    const { resume_data } = body;

    if (!resume_data) {
      return NextResponse.json({ error: 'Resume data is required' }, { status: 400 });
    }

    // Instantiate connection with Supabase
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();
    const user_id = session?.user?.id;

    if (!user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update the resume, ensuring it belongs to the current user
    const { data, error } = await supabase
      .from('resumes')
      .update({ resume_data })
      .eq('id', id)
      .eq('user_id', user_id) // Security check to ensure user owns the resume
      .select()
      .single();

    if (error) {
      console.error('Error updating resume:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Resume not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Resume updated successfully',
      resume: data 
    }, { status: 200 });
  } catch (error) {
    console.error('Error in PUT resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    // Instantiate connection with Supabase
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();
    const user_id = session?.user?.id;

    if (!user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the resume, ensuring it belongs to the current user
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id); // Security check to ensure user owns the resume

    if (error) {
      console.error('Error deleting resume:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Resume deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

