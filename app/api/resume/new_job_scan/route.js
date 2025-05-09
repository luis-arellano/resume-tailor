import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";


export async function POST(req) {
    const data = await req.formData();
    const resume = data.get('resume');
    const job_description = data.get('job_description');
    const resume_id = data.get('resume_id');
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const user_id = session?.user?.id

    console.log('user_id', user_id);

    try {
        // Create initial job_scan record
        const { data: job_scan, error } = await supabase
            .from('job_scans')
            .insert({
                user_id: user_id,
                resume_id: resume_id,
                job_description: job_description,
                status: 'processing'
            })
            .select()
            .single();

        if (error) throw error;

        // Trigger Cloud Run process asynchronously
        // const cloud_run_url = 'http://127.0.0.1:8080';
        const cloud_run_url = 'https://resume-parser-bskdj5y5hq-uc.a.run.app';
        try {
            const response = await fetch(`${cloud_run_url}/evaluate_resume`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.GOOGLE_CLOUD_API_KEY
                },
                body: JSON.stringify({
                    job_scan_id: job_scan.id,
                    resume,
                    job_description,
                    resume_id,
                    user_id
                })
            });
            
            if (!response.ok) {
                throw new Error(`Cloud Run request failed with status ${response.status}`);
            }
        } catch (error) {
            console.error('Error triggering Cloud Run job:', error);
            throw error; // Re-throw the error to be caught by the outer try-catch
        }

        return new NextResponse(JSON.stringify({ status: 'processing', job_scan_id: job_scan.id }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error initiating job:', error);
        return new NextResponse('Error initiating job', { status: 500 });
    }
}