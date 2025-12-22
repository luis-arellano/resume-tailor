"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FaDownload, FaEye, FaEdit, FaCheck, FaTimes, FaFileAlt, FaBuilding, FaBriefcase, FaChevronLeft, FaChevronRight, FaCodeBranch } from 'react-icons/fa';
import _ from 'lodash';
import apiClient from '@/libs/api';
import { useReactToPrint } from 'react-to-print';
import { TEMPLATES, templateMap } from '../resume_templates';

export default function TailoredResumeEditor({ tailoredResume, jobScan, onResumeUpdate, isAnalyzing = false }) {
  const [editableResumeData, setEditableResumeData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES.CLASSIC);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', null
  const [keywords, setKeywords] = useState([]);
  const [isJobDescriptionModalOpen, setIsJobDescriptionModalOpen] = useState(false);
  const [isKeywordsPanelCollapsed, setIsKeywordsPanelCollapsed] = useState(false);
  const [compositeScore, setCompositeScore] = useState(0);

  const refs = useRef({});
  const resumeRef = useRef(null);

  // Load panel state from localStorage on mount
  useEffect(() => {
    try {
      const savedPanelState = localStorage.getItem('keywordsPanelCollapsed');
      if (savedPanelState !== null) {
        setIsKeywordsPanelCollapsed(JSON.parse(savedPanelState));
      }
    } catch (error) {
      console.warn('Error loading keywords panel state from localStorage:', error);
      // Default to expanded if there's an error
      setIsKeywordsPanelCollapsed(false);
    }
  }, []);

  // Toggle keywords panel and save state
  const toggleKeywordsPanel = () => {
    const newState = !isKeywordsPanelCollapsed;
    setIsKeywordsPanelCollapsed(newState);
    try {
      localStorage.setItem('keywordsPanelCollapsed', JSON.stringify(newState));
    } catch (error) {
      console.warn('Error saving keywords panel state to localStorage:', error);
    }
  };

  // Initialize data when tailoredResume changes
  useEffect(() => {
    if (tailoredResume?.resume_data) {
      setEditableResumeData(tailoredResume.resume_data);
    }
  }, [tailoredResume]);

  // Extract keywords from job scan
  useEffect(() => {
    if (jobScan?.keywords) {
      try {
        let keywordList;
        
        if (typeof jobScan.keywords === 'string') {
          // Try to parse as JSON first
          try {
            keywordList = JSON.parse(jobScan.keywords);
          } catch (jsonError) {
            // If JSON parsing fails, treat as comma-separated string
            keywordList = jobScan.keywords
              .split(',')
              .map(keyword => keyword.trim())
              .filter(keyword => keyword.length > 0);
          }
        } else {
          keywordList = jobScan.keywords;
        }
        
        setKeywords(Array.isArray(keywordList) ? keywordList : []);
        console.log('Parsed keywords:', keywordList);
      } catch (error) {
        console.error('Error parsing keywords:', error);
        setKeywords([]);
      }
    } else {
      setKeywords([]);
    }
  }, [jobScan]);

  // Calculate keyword-based score whenever keywords or resume data changes
  useEffect(() => {
    console.log('Score calculation effect triggered', { 
      keywordsLength: keywords.length, 
      hasResumeData: !!editableResumeData 
    });
    
    if (keywords.length > 0 && editableResumeData) {
      const resumeText = JSON.stringify(editableResumeData).toLowerCase();
      const matchedKeywords = keywords.filter(keyword => 
        resumeText.includes(keyword.toLowerCase())
      );

      // Calculate keyword score (percentage of keywords matched)
      const keywordScore = Math.round((matchedKeywords.length / keywords.length) * 100);
      setCompositeScore(keywordScore);

      console.log('Keyword score calculation:', {
        keywordScore,
        matchedKeywords: matchedKeywords.length,
        totalKeywords: keywords.length,
        resumeTextLength: resumeText.length
      });
    } else {
      setCompositeScore(0);
      console.log('Score reset to 0');
    }
  }, [keywords, editableResumeData]);

  // Save resume data to backend
  const saveResumeToBackend = async (updatedResumeData) => {
    if (!tailoredResume?.id) return;

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const response = await apiClient.put(`/tailored-resumes/${tailoredResume.id}`, {
        resume_data: updatedResumeData
      });

      if (response.data) {
        onResumeUpdate(response.data);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 2000);
      }
    } catch (error) {
      console.error('Error saving tailored resume:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Update resume field
  const updateResumeField = (fieldPath, newValue) => {
    if (!editableResumeData) return;

    console.log('updateResumeField called:', { fieldPath, newValue });
    
    const updatedResume = _.cloneDeep(editableResumeData);
    _.set(updatedResume, fieldPath, newValue);
    setEditableResumeData(updatedResume);
    
    // Debounced save
    debouncedSave(updatedResume);
  };

  // Debounced save function
  const debouncedSave = _.debounce((resumeData) => {
    saveResumeToBackend(resumeData);
  }, 1000);

  // Handle field blur events
  const handleBlur = (fieldPath) => {
    const ref = refs.current[fieldPath];
    if (!ref) return;

    const newValue = ref.textContent;
    const currentValue = _.get(editableResumeData, fieldPath);

    if (newValue !== currentValue) {
      updateResumeField(fieldPath, newValue);
      // Apply keyword highlighting
      const highlightedContent = highlightKeywords(newValue);
      ref.innerHTML = highlightedContent;
    }
  };

  // Highlight keywords function - matches original editor styling
  const highlightKeywords = (text) => {
    if (!keywords.length || !text) return text;

    let highlightedText = text;
    
    keywords.forEach(keyword => {
      if (keyword && keyword.trim()) {
        const regex = new RegExp(`\\b(${keyword.trim().replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')})\\b`, 'gi');
        highlightedText = highlightedText.replace(
          regex, 
          '<span class="keyword-highlight">$1</span>'
        );
      }
    });

    return highlightedText;
  };

  // Create editable field helper - matches the original function signature
  const createEditableField = (fieldPath, placeholder = '', tag = 'div', className = '') => {
    if (!editableResumeData) return null;

    const value = _.get(editableResumeData, fieldPath, '');
    const highlightedValue = highlightKeywords(value);

    const Tag = tag;

    return (
      <Tag
        ref={(el) => {
          if (el) refs.current[fieldPath] = el;
        }}
        contentEditable={!isPreviewMode}
        suppressContentEditableWarning={true}
        onBlur={() => handleBlur(fieldPath)}
        dangerouslySetInnerHTML={{ __html: highlightedValue || placeholder }}
        className={`
          ${className}
          ${!isPreviewMode ? 'hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 cursor-text' : ''}
          ${!value && !isPreviewMode ? 'text-gray-400' : ''}
        `}
      />
    );
  };

  // Array manipulation functions
  const updateResumeArray = (arrayPath, action, index = null, newItem = null) => {
    if (!editableResumeData) return;

    const updatedResume = _.cloneDeep(editableResumeData);
    const array = _.get(updatedResume, arrayPath, []);

    switch (action) {
      case 'add':
        // For skills and other simple arrays, add a default string
        if (arrayPath === 'Skills' || arrayPath === 'Languages' || arrayPath === 'OtherInformation') {
          array.push(`New ${arrayPath.slice(0, -1)}`);
        } else if (arrayPath === 'Projects') {
          // Add default project structure
          array.push({
            Name: 'New Project',
            Duration: 'Jan 2024 - Present',
            Description: 'Project description...'
          });
        } else {
          array.push(newItem || {});
        }
        break;
      case 'remove':
        if (index !== null && index >= 0 && index < array.length) {
          array.splice(index, 1);
        }
        break;
      case 'update':
        if (index !== null && newItem) {
          array[index] = newItem;
        }
        break;
    }

    _.set(updatedResume, arrayPath, array);
    setEditableResumeData(updatedResume);
    saveResumeToBackend(updatedResume);
  };

  // Helper functions that match the original template expectations
  const addItem = (arrayPath) => updateResumeArray(arrayPath, 'add');
  const handleDelete = (arrayPath, index) => updateResumeArray(arrayPath, 'remove', index);

  // Date formatting helper function
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Present' || dateString === '') {
      return dateString;
    }

    // Handle range strings like "2014-01-01 to 2016-01-01"
    if (dateString.includes(' to ')) {
      const [startDate, endDate] = dateString.split(' to ');
      const formattedStart = formatDate(startDate);
      const formattedEnd = formatDate(endDate);
      return `${formattedStart} - ${formattedEnd}`;
    }

    // Try to parse as ISO date (YYYY-MM-DD)
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const options = { year: 'numeric', month: 'short' };
      return date.toLocaleDateString('en-US', options);
    }

    // If it's not a valid date, return as-is
    return dateString;
  };

  // Enhanced createEditableField that can format dates
  const createFormattedField = (fieldPath, placeholder = '', tag = 'div', className = '', isDate = false) => {
    if (!editableResumeData) return null;

    let value = _.get(editableResumeData, fieldPath, '');
    
    // Apply date formatting if this is a date field
    if (isDate && value) {
      value = formatDate(value);
    }

    const highlightedValue = highlightKeywords(value);
    const Tag = tag;

    return (
      <Tag
        ref={(el) => {
          if (el) refs.current[fieldPath] = el;
        }}
        contentEditable={!isPreviewMode}
        suppressContentEditableWarning={true}
        onBlur={() => handleBlur(fieldPath)}
        dangerouslySetInnerHTML={{ __html: highlightedValue || placeholder }}
        className={`
          ${className}
          ${!isPreviewMode ? 'hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 cursor-text' : ''}
          ${!value && !isPreviewMode ? 'text-gray-400' : ''}
        `}
      />
    );
  };

  // Print function
  const handlePrint = useReactToPrint({
    content: () => resumeRef.current,
  });

  // Get template component
  const TemplateComponent = templateMap[selectedTemplate];

  if (!editableResumeData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        {/* Job Info and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">

          <div className="flex items-center space-x-4">

          <div className="flex items-center space-x-1">
            <FaCodeBranch className="h-3 w-3 text-gray-500" />
            <span className="text-sm font-bold text-gray-500">Tailored Resume</span>
          </div>

          <span className="text-sm text-gray-500">|</span>


            {/* Job Info */}
            <div className="flex items-center space-x-3 text-sm">
              {/* Company */}
              <div className="flex items-center space-x-1">
                <FaBuilding className="h-3 w-3 text-gray-500" />
                {isAnalyzing && !jobScan?.company ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                    <span className="text-xs text-gray-500">analyzing...</span>
                  </div>
                ) : (
                  <span className="text-gray-700">{jobScan?.company || 'Unknown Company'}</span>
                )}
              </div>

              {/* Job Title */}
              <div className="flex items-center space-x-1">
                <FaBriefcase className="h-3 w-3 text-gray-500" />
                {isAnalyzing && !jobScan?.job_title ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
                    <span className="text-xs text-gray-500">analyzing...</span>
                  </div>
                ) : (
                  <span className="text-gray-600">{jobScan?.job_title || 'Position'}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Job Description Viewer */}
            {jobScan?.job_description && (
              <button
                onClick={() => setIsJobDescriptionModalOpen(true)}
                className="flex items-center space-x-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <FaFileAlt className="h-3 w-3" />
                <span>Job Description</span>
              </button>
            )}
            
            {/* Start New Application */}
            <button
              onClick={() => window.location.href = '/dashboard/new-job-application'}
              className="flex items-center space-x-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              <span>+ New Application</span>
            </button>

            <div className="text-xs text-gray-500">
              Based on: {tailoredResume?.resumes?.file_name}
            </div>
          </div>
        </div>

        {/* Editor Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Preview/Edit Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`
                  flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors
                  ${isPreviewMode 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }
                `}
              >
                {isPreviewMode ? (
                  <>
                    <FaEdit className="h-4 w-4" />
                    <span>Edit Mode</span>
                  </>
                ) : (
                  <>
                    <FaEye className="h-4 w-4" />
                    <span>Preview Mode</span>
                  </>
                )}
              </button>
            </div>

            {/* Template Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Template:</span>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value={TEMPLATES.CLASSIC}>Classic</option>
                <option value={TEMPLATES.MODERN}>Modern</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Save Status */}
            <div className="flex items-center space-x-2">
              {isSaving && (
                <span className="text-sm text-blue-600 flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              )}
              {saveStatus === 'success' && (
                <span className="text-sm text-green-600 flex items-center">
                  <FaCheck className="mr-2 h-4 w-4" />
                  Saved
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-sm text-red-600 flex items-center">
                  <FaTimes className="mr-2 h-4 w-4" />
                  Save failed
                </span>
              )}
            </div>

            {/* Download Button */}
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <FaDownload className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Sidebar + Resume */}
      <div className="flex gap-4 h-[calc(100vh-200px)] min-h-96">
        {/* Keywords Sidebar */}
        <div className={`
          bg-white rounded-lg shadow-sm border transition-all duration-300 ease-in-out flex-shrink-0
          ${isKeywordsPanelCollapsed ? 'w-12' : 'w-80'}
        `}>
          {isKeywordsPanelCollapsed ? (
            // Collapsed Panel
            <div className="h-full flex flex-col items-center">
              <button
                onClick={toggleKeywordsPanel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-4"
                title="Expand Keywords Panel"
              >
                <FaChevronRight className="h-4 w-4 text-gray-500" />
              </button>
              
              {/* Vertical Score and Match Count */}
              {keywords.length > 0 && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <div className={`text-lg font-bold ${
                    compositeScore >= 50 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {compositeScore}
                  </div>
                  <div className="writing-mode-tb text-xs text-gray-500">
                    {keywords.filter(keyword => {
                      const resumeText = JSON.stringify(editableResumeData).toLowerCase();
                      return resumeText.includes(keyword.toLowerCase());
                    }).length}/{keywords.length}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Expanded Panel
            <div className="h-full flex flex-col">
              {/* Panel Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">Keywords Analysis</h3>
                <button
                  onClick={toggleKeywordsPanel}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Collapse Keywords Panel"
                >
                  <FaChevronLeft className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-3">
                {isAnalyzing && keywords.length === 0 ? (
                  // Loading state
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="text-xs text-gray-600">Analyzing keywords</div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                    
                    {/* Loading skeleton */}
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="w-full h-6 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-4">
                      🔍 Extracting keywords from job description...
                    </div>
                  </div>
                ) : keywords.length > 0 ? (
                  // Keywords analysis
                  <div className="space-y-3">
                    {/* Score Display */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="text-center">
                        <div className="text-xs text-gray-600 font-medium mb-1">Match Score</div>
                        <div className={`text-2xl font-bold ${
                          compositeScore >= 50 ? 'text-green-300' : 'text-red-300'
                        }`}>
                          {compositeScore}
                        </div>
                        <div className="text-xs text-gray-600">
                          {keywords.filter(keyword => {
                            const resumeText = JSON.stringify(editableResumeData).toLowerCase();
                            return resumeText.includes(keyword.toLowerCase());
                          }).length} of {keywords.length} keywords matched
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          💡 Add missing (red) keywords to improve score
                        </div>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-2">
                        {keywords.length} keywords found
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Matches</span>
                          </span>
                          <span className="font-medium">
                            {keywords.filter(keyword => {
                              const resumeText = JSON.stringify(editableResumeData).toLowerCase();
                              return resumeText.includes(keyword.toLowerCase());
                            }).length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>Missing</span>
                          </span>
                          <span className="font-medium">
                            {keywords.filter(keyword => {
                              const resumeText = JSON.stringify(editableResumeData).toLowerCase();
                              return !resumeText.includes(keyword.toLowerCase());
                            }).length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Keywords List */}
                    <div className="flex flex-wrap gap-1.5">
                      {keywords.map((keyword, index) => {
                        const resumeText = JSON.stringify(editableResumeData).toLowerCase();
                        const isPresent = resumeText.includes(keyword.toLowerCase());
                        
                        return (
                          <span 
                            key={index}
                            className={`
                              inline-flex items-center px-1.5 py-1 rounded text-xs
                              ${isPresent 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-red-100 text-red-700 border border-red-200'
                              }
                            `}
                            title={isPresent ? 'Found in resume' : 'Missing from resume'}
                            style={{ fontSize: '10px', lineHeight: '12px' }}
                          >
                            <span className="leading-none">{keyword}</span>
                            <span className={`ml-1 ${isPresent ? 'text-green-600' : 'text-red-600'}`}>
                              {isPresent ? '✓' : '✗'}
                            </span>
                          </span>
                        );
                      })}
                    </div>

                  </div>
                ) : !isAnalyzing && jobScan?.status === 'error' ? (
                  // Error state
                  <div className="text-xs text-red-600 p-3 bg-red-50 rounded-lg border border-red-200">
                    ⚠️ Keyword analysis failed. You can still edit your resume manually.
                  </div>
                ) : !isAnalyzing && jobScan?.status === 'completed' && keywords.length === 0 ? (
                  // No keywords found
                  <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
                    No keywords extracted from this job description.
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Resume Editor */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border overflow-y-auto">
          <div className="p-6">
            <TemplateComponent
              resumeData={editableResumeData}
              refs={refs}
              resumeRef={resumeRef}
              createEditableField={createEditableField}
              createFormattedField={createFormattedField}
              handleDelete={handleDelete}
              addItem={addItem}
              updateResumeArray={updateResumeArray}
              isPreviewMode={isPreviewMode}
            />
          </div>
        </div>
      </div>

      {/* Job Description Modal */}
      {isJobDescriptionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Job Description</h3>
                <div className="flex items-center space-x-4 mt-1">
                  {jobScan?.company && (
                    <div className="flex items-center space-x-1">
                      <FaBuilding className="h-3 w-3 text-gray-500" />
                      <span className="text-sm text-gray-600">{jobScan.company}</span>
                    </div>
                  )}
                  {jobScan?.job_title && (
                    <div className="flex items-center space-x-1">
                      <FaBriefcase className="h-3 w-3 text-gray-500" />
                      <span className="text-sm text-gray-600">{jobScan.job_title}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsJobDescriptionModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {jobScan?.job_description}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-500">
                Used to create keywords and tailor your resume
              </div>
              <button
                onClick={() => setIsJobDescriptionModalOpen(false)}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}