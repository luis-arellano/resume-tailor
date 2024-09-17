import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req) {
    const data = await req.formData();
    const uploadedFiles = data.getAll('resume');

    if (!uploadedFiles || uploadedFiles.length === 0) {
        return new NextResponse('No files found.', { status: 400 });
    }

    const uploadedFile = uploadedFiles[0];
    const originalFileName = uploadedFile.name;

    // Generate a unique filename
    const fileName = uuidv4();

    // Instantiate connection with Supabase
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const user_id = session?.user?.id;

    try {
        // Save initial information to Supabase
        const { data: resumeRecord, error } = await supabase
            .from('resumes')
            .insert({
                user_id: user_id,
                file_name: originalFileName,
                status: 'processing'
            })
            .select()
            .single();

        if (error) throw error;

        // Convert file to base64
        const fileBuffer = await uploadedFile.arrayBuffer();
        const fileBase64 = Buffer.from(fileBuffer).toString('base64');

        // Trigger Cloud Run process asynchronously
        const base_url = 'http://127.0.0.1:8080';
        const response = await fetch(base_url+'/process_resume', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.GOOGLE_CLOUD_API_KEY
            },
            body: JSON.stringify({
                resume_id: resumeRecord.id,
                file_name: fileName,
                file_content: fileBase64,
                user_id: user_id
            })
        });

        if (!response.ok) {
            throw new Error(`Cloud Run request failed with status ${response.status}`);
        }

        return new NextResponse(JSON.stringify({ 
            status: 'processing', 
            resume_id: resumeRecord.id,
            file_name: originalFileName
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error processing resume:', error);
        return new NextResponse('Error processing resume', { status: 500 });
    }
}