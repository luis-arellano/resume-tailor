import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";


export async function POST(req) {
    const form_data = await req.formData();
    const resume_data = JSON.parse(form_data.get('resume_json'));
    const resume_id = form_data.get('resume_id');
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const {data: { session }} = await supabase.auth.getSession();
    const user_id = session?.user?.id

    const update_response = await supabase
        .from('resumes')
        .update({ resume_data: resume_data })
        .eq('id', parseInt(resume_id))
        .select();


    return NextResponse.json(resume_data)
}