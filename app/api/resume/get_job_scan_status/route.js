import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req) {
    console.log('Triggered get Job Scan Status');
    const { searchParams } = new URL(req.url);
    const job_scan_id = searchParams.get('job_scan_id');

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
        const { data, error } = await supabase
            .from('job_scans')
            .select('*')
            .eq('id', job_scan_id)
            .single();

        if (error) throw error;

        if (!data) {
            return new NextResponse(JSON.stringify({ status: 'not_found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new NextResponse(JSON.stringify({
            status: data.status,
            result: data.status === 'completed' ? {
                key_words: data.keywords,
                job_analysis: data.job_analysis
            } : null
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching job scan status:', error);
        return new NextResponse('Error fetching job scan status', { status: 500 });
    }
}