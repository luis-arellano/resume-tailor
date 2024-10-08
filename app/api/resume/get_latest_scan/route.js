import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get('resumeId');

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId || !resumeId) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized or missing resumeId' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const { data, error } = await supabase
        .from('job_scans')
        .select('keywords, job_analysis, job_description')
        .eq('user_id', userId)
        .eq('resume_id', resumeId)
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        return new NextResponse(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Return null if no data found
    const latestScan = data && data.length > 0 ? data[0] : null;
    return new NextResponse(JSON.stringify(latestScan), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}