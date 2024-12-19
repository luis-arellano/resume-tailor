import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req) {

    // Get the resume ID from the request
    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get('resume_id');

    if (!resumeId) {
        return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    // Instantiate connection with Supabase
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();
    const user_id = session?.user?.id;
    console.log('user_id:', user_id);

    // Delete the resume, ensuring it belongs to the current user
    const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId)
        .eq('user_id', user_id); // Security check to ensure user owns the resume

    if (error) {
        console.log('error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Resume deleted successfully' },{ status: 200 } );
}