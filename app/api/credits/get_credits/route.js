export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req) {
    try {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
        const {
            data: { session },
          } = await supabase.auth.getSession();

        const { data, error } = await supabase
        .from("profiles")
        .select("credits, email, customer_id")
        .eq("id", session.user.id)
        .single(); 
        if (error) throw new Error(`No profile found for user: ${session.user.id}`);
        return NextResponse.json({ data: data.credits}, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: `User has no credits: ${error}`}, { status: 402 });
    }
}