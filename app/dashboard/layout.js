import { redirect } from "next/navigation";
import config from "@/config";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import SideMenu from "./components/side_menu";
import DashboardHeader from "./components/header";

// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
// It's applied to all subpages of /dashboard in /app/dashboard/*** pages
// You can also add custom static UI elements like a Navbar, Sidebar, Footer, etc..
// See https://shipfa.st/docs/tutorials/private-page
export default async function LayoutPrivate({ children }) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(config.auth.loginUrl);
  }

  // Get user's profile to check subscription status
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  console.log('PROFILE DATA: ',profile);

  if (!profile?.has_access) {
    redirect("/pricing"); // Create a pricing page or use your preferred route
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="w-full">
        <DashboardHeader />
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="h-full">
          <SideMenu />
        </aside>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
