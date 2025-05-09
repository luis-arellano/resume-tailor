"use client";
import ResumeDisplay from "./components/resume_display";
import JobScan from "./components/job_scan";
import { ModelProvider } from "./context";
import ScoreAnalysis from "./components/score_and_analysis";

export const dynamic = "force-dynamic";

export default function Dashboard() {
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
}