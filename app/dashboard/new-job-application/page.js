"use client";

import React, { useRef } from 'react';
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