"use client";

import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaFileAlt, FaUpload } from 'react-icons/fa';
import apiClient from '@/libs/api';
import { useInterval } from '../../hooks/useInterval';

export default function MasterResumeSelector({ selectedResume, onResumeSelect }) {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [newlyUploadedResumeId, setNewlyUploadedResumeId] = useState(null);

  // Load resumes on component mount and refresh
  const loadResumes = async () => {
    try {
      const response = await apiClient.get('/resumes');
      // Sort by most recently created
      const sortedResumes = response.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setResumes(sortedResumes);
      
      // Auto-select the first resume if none selected and resumes exist
      if (!selectedResume && sortedResumes.length > 0 && sortedResumes[0].status === 'completed') {
        onResumeSelect(sortedResumes[0]);
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, [refreshKey]);

  // Poll for processing resumes
  useInterval(
    () => {
      const processingResumes = resumes.some(resume => resume.status === 'processing');
      if (processingResumes) {
        setRefreshKey(prev => prev + 1);
      }
    },
    resumes.some(resume => resume.status === 'processing') ? 2000 : null
  );

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingFile(file);
    setUploadSuccess(false);
    event.target.value = ''; // Reset input

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await apiClient.post('/resumes', formData);
      
      // Show success message and track new resume
      setUploadSuccess(true);
      setNewlyUploadedResumeId(response.data?.id);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 5000);
      
      setRefreshKey(prev => prev + 1); // Trigger resume list refresh
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadingFile(null);
    }
  };

  // Handle resume selection
  const handleSelectResume = (resume) => {
    if (resume.status !== 'completed') return; // Don't allow selection of processing/error resumes
    onResumeSelect(resume);
    setIsDropdownOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  const completedResumes = resumes.filter(resume => resume.status === 'completed');

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <div className="space-y-3">
          <FaUpload className="mx-auto h-8 w-8 text-gray-400" />
          <div>
            <label
              htmlFor="resume-upload"
              className="inline-flex items-center btn-special cursor-pointer"
            >
              <FaUpload className="mr-2 h-4 w-4" />
              Upload New Resume
            </label>
            <p className="text-xs text-gray-500 mt-2">PDF, DOC, or DOCX up to 10MB</p>
          </div>
          <input
            id="resume-upload"
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            disabled={!!uploadingFile}
          />
        </div>

        {uploadingFile && (
          <div className="mt-3 text-sm text-blue-600">
            <span className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing {uploadingFile.name}...
            </span>
          </div>
        )}

        {uploadSuccess && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm text-green-800">
              <span className="inline-flex items-center">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Upload successful! 
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              We&apos;re processing your resume. This usually takes 30-60 seconds.
            </p>
          </div>
        )}
      </div>

      {/* Resume Selection Dropdown */}
      <div className="relative">
        <div
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`
            flex items-center justify-between p-3 bg-white border rounded-lg cursor-pointer
            ${selectedResume ? 'border-black' : 'border-gray-300'} 
            hover:border-gray-400 transition-colors
          `}
        >
          <div className="flex items-center space-x-3">
            <FaFileAlt className="h-4 w-4 text-gray-400" />
            <div>
              {selectedResume ? (
                <div>
                  <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                    {selectedResume.file_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(selectedResume.created_at).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  {completedResumes.length > 0 ? 'Select a master resume' : 'No resumes available'}
                </div>
              )}
            </div>
          </div>
          {completedResumes.length > 0 && (
            <div className="text-gray-400">
              {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>
          )}
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && completedResumes.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border shadow-lg max-h-60 overflow-y-auto">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                onClick={() => handleSelectResume(resume)}
                className={`
                  p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50
                  ${resume.status !== 'completed' ? 'opacity-50 cursor-not-allowed' : ''}
                  ${selectedResume?.id === resume.id ? 'bg-gray-100' : ''}
                  ${resume.id === newlyUploadedResumeId && resume.status === 'processing' ? 'bg-green-25 border-l-4 border-l-green-400' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {resume.file_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(resume.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {resume.status === 'processing' && (
                      <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {resume.status === 'error' && (
                      <span className="text-red-500 text-xs">⚠️</span>
                    )}
                    {resume.status === 'completed' && selectedResume?.id === resume.id && (
                      <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {completedResumes.length === 0 && resumes.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <FaFileAlt className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <div className="text-sm">No resumes uploaded yet</div>
          <div className="text-xs">Upload your first resume to get started</div>
        </div>
      )}
    </div>
  );
}