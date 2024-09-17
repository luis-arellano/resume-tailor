import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get('resume_id');

    if (!resumeId) {
        return new NextResponse('Resume ID is required', { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
        const { data, error } = await supabase
            .from('resumes')
            .select('status')
            .eq('id', resumeId)
            .single();

        if (error) throw error;

        return new NextResponse(JSON.stringify({ status: data.status }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error checking resume status:', error);
        return new NextResponse('Error checking resume status', { status: 500 });
    }
}