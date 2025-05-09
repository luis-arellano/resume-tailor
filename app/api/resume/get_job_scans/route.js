import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();
    const user_id = session?.user?.id;

    if (!user_id) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { data, error } = await supabase
            .from('job_scans')
            .select('*',
            )
            .eq('user_id', user_id)

        if (error) throw error;

        return new NextResponse(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching job scans:', error);
        return new NextResponse(JSON.stringify({ error: 'Error fetching job scans' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
} 