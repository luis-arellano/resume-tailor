"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MasterResumeSelector from './master_resume_selector';
import JobDescriptionInput from './job_description_input';
import TailoredResumeEditor from './tailored_resume_editor';
import apiClient from '@/libs/api';
import { useInterval } from '../../hooks/useInterval';

// Workflow states
const WORKFLOW_STATES = {
  LOADING: 'loading',    // Loading existing tailored resume or checking recent work
  RECENT_WORK: 'recent_work', // Showing recent work options
  SETUP: 'setup',        // Selecting master resume + job description
  PROCESSING: 'processing', // Creating tailored resume
  EDITING: 'editing'     // Editing the tailored resume
};

const NewJobApplicationWorkflow = forwardRef((props, ref) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [workflowState, setWorkflowState] = useState(WORKFLOW_STATES.LOADING);
  const [selectedMasterResume, setSelectedMasterResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobScan, setJobScan] = useState(null);
  const [tailoredResume, setTailoredResume] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [jobScanId, setJobScanId] = useState(null);
  const [recentTailoredResumes, setRecentTailoredResumes] = useState([]);

  // Initialize workflow - check URL params and recent work
  useEffect(() => {
    const initializeWorkflow = async () => {
      try {
        const resumeId = searchParams.get('resumeId'); // URL: ?resumeId=123
        
        if (resumeId) {
          // Load specific tailored resume from URL
          await loadExistingTailoredResume(resumeId);
        } else {
          // Check for recent work
          await loadRecentWork();
        }
      } catch (error) {
        console.error('Error initializing workflow:', error);
        setError('Failed to load. Starting fresh workflow.');
        setWorkflowState(WORKFLOW_STATES.SETUP);
      }
    };

    initializeWorkflow();
  }, [searchParams]);

  // Load existing tailored resume from URL parameter
  const loadExistingTailoredResume = async (resumeId) => {
    try {
      console.log('Loading existing tailored resume:', resumeId);
      const response = await apiClient.get(`/tailored-resumes/${resumeId}`);
      const tailoredResumeData = response.data;

      console.log('Loaded tailored resume:', tailoredResumeData);
      
      setTailoredResume(tailoredResumeData);
      setJobScan(tailoredResumeData.job_scans);
      
      // Set job scan ID and start polling if still processing
      if (tailoredResumeData.job_scans?.id) {
        setJobScanId(tailoredResumeData.job_scans.id);
        if (tailoredResumeData.job_scans.status === 'processing') {
          setIsPolling(true);
        }
      }
      
      setWorkflowState(WORKFLOW_STATES.EDITING);
    } catch (error) {
      console.error('Error loading tailored resume:', error);
      setError('Tailored resume not found. Starting new application.');
      setWorkflowState(WORKFLOW_STATES.SETUP);
    }
  };

  // Load recent tailored resumes to show "continue work" options
  const loadRecentWork = async () => {
    try {
      console.log('Checking for recent work...');
      const response = await apiClient.get('/tailored-resumes?limit=5&sort=created_at&order=desc');
      const recentResumes = response.data;

      console.log('Recent tailored resumes:', recentResumes);

      // Filter for resumes from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentWork = recentResumes.filter(resume => 
        new Date(resume.created_at) > sevenDaysAgo
      );

      if (recentWork.length > 0) {
        setRecentTailoredResumes(recentWork);
        setWorkflowState(WORKFLOW_STATES.RECENT_WORK);
      } else {
        setWorkflowState(WORKFLOW_STATES.SETUP);
      }
    } catch (error) {
      console.error('Error loading recent work:', error);
      setWorkflowState(WORKFLOW_STATES.SETUP);
    }
  };

  // Handle continuing with recent work
  const handleContinueRecentWork = (tailoredResumeId) => {
    // Update URL and reload the specific tailored resume
    router.push(`/dashboard/new-job-application?resumeId=${tailoredResumeId}`);
  };

  // Handle starting new application
  const handleStartNew = () => {
    setWorkflowState(WORKFLOW_STATES.SETUP);
    // Clear URL parameters
    router.push('/dashboard/new-job-application');
  };

  // Expose handleStartNew to parent component
  useImperativeHandle(ref, () => ({
    handleStartNew
  }));

  // Handle creating the job scan and tailored resume
  const handleCreateJobApplication = async () => {
    if (!selectedMasterResume || !jobDescription.trim()) {
      setError('Please select a master resume and enter a job description');
      return;
    }

    setIsCreating(true);
    setError(null);
    setWorkflowState(WORKFLOW_STATES.PROCESSING);

    try {
      // Create job scan v2 which also creates tailored resume
      const response = await apiClient.post('/job-scans-v2', {
        resume: selectedMasterResume.resume_data,
        job_description: jobDescription,
        resume_id: selectedMasterResume.id
      });

      console.log('Job scan created:', response.data);
      
      setJobScan(response.data);
      setJobScanId(response.data.id);
      
      // Fetch the created tailored resume
      const tailoredResumeResponse = await apiClient.get(`/tailored-resumes/${response.data.tailored_resume_id}`);
      console.log('Tailored resume fetched:', tailoredResumeResponse.data);
      
      setTailoredResume(tailoredResumeResponse.data);
      setWorkflowState(WORKFLOW_STATES.EDITING);
      
      // Update URL to include tailored resume ID for persistence
      router.push(`/dashboard/new-job-application?resumeId=${tailoredResumeResponse.data.id}`);
      
      // Start polling for job scan updates if still processing
      if (response.data.status === 'processing') {
        setIsPolling(true);
      }

    } catch (error) {
      console.error('Error creating job application:', error);
      setError('Failed to create job application. Please try again.');
      setWorkflowState(WORKFLOW_STATES.SETUP);
    } finally {
      setIsCreating(false);
    }
  };

  // Polling mechanism for job scan updates
  useInterval(
    async () => {
      if (jobScanId && isPolling) {
        try {
          console.log('Polling job scan status:', jobScanId);
          const response = await apiClient.get(`/job_scans/${jobScanId}`);
          console.log('Job scan poll response:', response.data);
          
          // Update job scan data
          setJobScan(response.data);
          
          // Stop polling if completed or error
          if (response.data.status === 'completed' || response.data.status === 'error') {
            setIsPolling(false);
            console.log('Job scan analysis completed:', response.data.status);
          }
        } catch (error) {
          console.error('Error polling job scan:', error);
          // Continue polling on network errors, stop on permanent errors
          if (error.response?.status === 404) {
            setIsPolling(false);
            setError('Job scan not found');
          }
        }
      }
    },
    isPolling ? 2500 : null // Poll every 2.5 seconds when active
  );

  // Handle starting over
  const handleStartOver = () => {
    setWorkflowState(WORKFLOW_STATES.SETUP);
    setSelectedMasterResume(null);
    setJobDescription('');
    setJobScan(null);
    setTailoredResume(null);
    setError(null);
    setIsPolling(false);
    setJobScanId(null);
  };

  // Render different content based on workflow state
  const renderContent = () => {
    switch (workflowState) {
      case WORKFLOW_STATES.LOADING:
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
            <p className="text-sm text-gray-600 max-w-md text-center">
              Checking for recent work and initializing the application.
            </p>
          </div>
        );

      case WORKFLOW_STATES.RECENT_WORK:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
              <p className="text-sm text-gray-600 mb-6">
                You have recent job applications. Continue where you left off or start a new one.
              </p>
            </div>

            {/* Recent Work Options */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
                <p className="text-sm text-gray-600">From the last 7 days</p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {recentTailoredResumes.map((resume) => (
                  <div key={resume.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {resume.job_scans?.company || 'Unknown Company'} - {resume.job_scans?.job_title || 'Position'}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <p className="text-xs text-gray-500">
                                Based on: {resume.resumes?.file_name}
                              </p>
                              <span className="text-xs text-gray-400">•</span>
                              <p className="text-xs text-gray-500">
                                {new Date(resume.created_at).toLocaleDateString()}
                              </p>
                              <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                resume.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                resume.status === 'final' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {resume.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleContinueRecentWork(resume.id)}
                        className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        );

      case WORKFLOW_STATES.SETUP:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Master Resume Selection */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Step 1: Select Master Resume
                </h2>
                <MasterResumeSelector 
                  selectedResume={selectedMasterResume}
                  onResumeSelect={setSelectedMasterResume}
                />
              </div>

              {/* Job Description Input */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Step 2: Add Job Description
                </h2>
                <JobDescriptionInput 
                  value={jobDescription}
                  onChange={setJobDescription}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              </div>
            )}

            {/* Create Button */}
            <div className="flex justify-center">
              <button
                onClick={handleCreateJobApplication}
                disabled={isCreating || !selectedMasterResume || !jobDescription.trim()}
                className={`
                  px-8 py-3 rounded-lg font-semibold text-white
                  ${(!selectedMasterResume || !jobDescription.trim()) 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-black hover:bg-gray-800 transition-colors'
                  }
                `}
              >
                {isCreating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Tailored Resume...
                  </span>
                ) : (
                  'Create Tailored Resume'
                )}
              </button>
            </div>
          </div>
        );

      case WORKFLOW_STATES.PROCESSING:
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Creating Your Tailored Resume</h3>
            <p className="text-sm text-gray-600 max-w-md text-center">
              We&apos;re analyzing the job description and creating a customized version of your resume. 
              This usually takes a few seconds...
            </p>
          </div>
        );

      case WORKFLOW_STATES.EDITING:
        return (
          <div className="space-y-4">
            {/* Header with job info and actions */}
            {/* <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Tailored Resume Editor
                  </h2>
                  <p className="text-sm text-gray-600">
                    Based on: {selectedMasterResume?.file_name}
                    {jobScan?.company_name && (
                      <span> • {jobScan.company_name}</span>
                    )}
                    {jobScan?.position_title && (
                      <span> • {jobScan.position_title}</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={handleStartOver}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Start Over
                </button>
              </div>
            </div> */}

            {/* Tailored Resume Editor */}
            <TailoredResumeEditor 
              tailoredResume={tailoredResume}
              jobScan={jobScan}
              onResumeUpdate={setTailoredResume}
              isAnalyzing={isPolling}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {renderContent()}
    </div>
  );
});

NewJobApplicationWorkflow.displayName = 'NewJobApplicationWorkflow';

export default NewJobApplicationWorkflow;