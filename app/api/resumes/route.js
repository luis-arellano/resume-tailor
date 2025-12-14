import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

// Get all resumes for the current user
export async function GET() {
  // Instantiate connection with Supabase
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();
  const user_id = session?.user?.id;

  const { data, error } = await supabase
    .from('resumes')
    .select('id, file_name, resume_data, created_at, status') 
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return NextResponse.json(data);
}