"use client";

import React, { useState, useRef } from 'react';
import NewJobApplicationWorkflow from '../components/new_job_application_workflow';

export default function NewJobApplicationPage() {
  const workflowRef = useRef();

  const handleStartNew = () => {
    if (workflowRef.current?.handleStartNew) {
      workflowRef.current.handleStartNew();
    } else {
      // Fallback to page reload if ref method not available
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">New Job Application</h1>
              <p className="text-sm text-gray-600 mt-2">
                Create a tailored resume for your job application. Select a master resume template, 
                paste the job description, and customize your resume for this specific role.
              </p>
            </div>
            
            <button
              onClick={handleStartNew}
              className="btn-special"
            >
              Start New Application
            </button>
          </div>
        </div>
        
        <NewJobApplicationWorkflow ref={workflowRef} />
      </div>
    </div>
  );
}