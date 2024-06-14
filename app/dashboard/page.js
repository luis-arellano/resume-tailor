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
  const [file, setFile] = useState(null);
  const [resumes, setResumes] = useState([]);

  // Get resumes associated with the user.
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await apiClient.get('/resume/get');
        setResumes(response); // Assuming the response data is the array of resumes
        console.log('RESPONSE: ', response);
      } catch (error) {
        console.error('Error fetching resumes:', error);
      }
    };
    fetchResumes();
  }, []);

  return (
    <>
      <ModelProvider>
        <DashboardHeader />
        <main className="flex p-8 flex-col items-center">

          <JobScan />

        </main>

        <section className="w-full max-w-4xl space-y-8">
            {resumes.map(resume => (
              <ResumeDisplay key={resume.file_name} resume={resume.resume_data} />
            ))}
          </section>
      </ModelProvider>
    </>

  );
}