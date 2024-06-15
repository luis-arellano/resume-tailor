"use client";
import ButtonAccount from "@/components/ButtonAccount";
import { useState } from 'react';
import apiClient from "@/libs/api";
import { useEffect } from "react";
import ResumeDisplay from "./components/resume_display";
import JobScan from "./components/job_scan";
import DashboardHeader from "./components/header";
import { ModelProvider } from "./context";

export const dynamic = "force-dynamic";

export default function Dashboard() {

  return (
    <>
      <ModelProvider>
        <DashboardHeader />
        <main className="flex p-8 flex-col items-center">

          <JobScan />

        </main>

        <section className="w-full max-w-4xl space-y-8">
            <ResumeDisplay/>
          </section>
      </ModelProvider>
    </>

  );
}