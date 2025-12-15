"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Legacy dashboard imports - kept for reference
// import ResumeDisplay from "./components/resume_display";
// import JobScan from "./components/job_scan";
// import { ModelProvider } from "./context";
// import ScoreAnalysis from "./components/score_and_analysis";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new job application workflow
    router.replace('/dashboard/new-job-application');
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to New Job Application...</p>
      </div>
    </div>
  );

  /* LEGACY DASHBOARD - KEPT FOR REFERENCE
  return (
    <ModelProvider>
      <div className="dotted-grid min-h-screen">
        <main className="flex p-8 flex-col items-center">
          <JobScan />
        </main>

        <section className="flex p-8 w-full mx-auto">
          <div className="flex flex-col w-2/5 overflow-x-scroll">
            <ScoreAnalysis />
          </div>  

          <div className="flex flex-col w-3/5 overflow-x-scroll">
            <ResumeDisplay/>
          </div>
        </section>
      </div>
    </ModelProvider>
  );
  */
}