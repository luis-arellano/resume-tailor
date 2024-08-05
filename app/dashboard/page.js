"use client";
import ButtonAccount from "@/components/ButtonAccount";
import { useState } from 'react';
import apiClient from "@/libs/api";
import { useEffect } from "react";
import ResumeDisplay from "./components/resume_display";
import JobScan from "./components/job_scan";
import DashboardHeader from "./components/header";
import { ModelProvider } from "./context";
import ScoreAnalysis from "./components/score_and_analysis";

export const dynamic = "force-dynamic";

export default function Dashboard() {

  return (
    <>
    <div className="dotted-grid"> 
    <ModelProvider>
        <DashboardHeader />
        <main className="flex p-8 flex-col items-center">

          <JobScan />

        </main>

        <section className="flex p-8 w-full mx-auto">

          <div className="flex flex-col w-2/5 overflow-x-scroll">
              <ScoreAnalysis />
          </div>  

          <div className="flex flex-col w-3/5 overflow-x-scroll ">
            <ResumeDisplay/>
          </div>

        </section>
      </ModelProvider>

    </div>

    </>

  );
}