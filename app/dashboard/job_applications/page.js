"use client";
import { useEffect, useState, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import apiClient from "@/libs/api";
import { 
  DocumentIcon,
  EyeIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  BriefcaseIcon,
  CheckBadgeIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const STATUS_OPTIONS = [
  { value: 'interested', label: 'Interested', icon: CheckCircleIcon, color: 'text-blue-500' },
  { value: 'interview', label: 'Interview', icon: ChatBubbleLeftRightIcon, color: 'text-yellow-500' },
  { value: 'offer', label: 'Offer', icon: CheckBadgeIcon, color: 'text-green-500' },
  { value: 'rejected', label: 'Rejected', icon: XMarkIcon, color: 'text-red-500' }
];

export default function JobApplications() {
  const [jobScans, setJobScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStatusDropdown, setShowStatusDropdown] = useState(null);
  const [selectedJobDescription, setSelectedJobDescription] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const supabase = createClientComponentClient();
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchJobScans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const response = await fetch('/api/job_scans?sort=created_at&order=desc');
        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.error?.message || 'Failed to fetch job scans');
        }

        setJobScans(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching job scans:', error);
      setJobScans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobScans();
  }, []);

  const handleStatusChange = async (scanId, newStatus) => {
    try {
      setUpdatingStatus(scanId);
      setUpdateError(null);

      const response = await fetch(`/api/job_scans/${scanId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_status: newStatus
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error?.message || 'Failed to update status');
      }

      // Refresh the job scans data after successful update
      await fetchJobScans();
      setShowStatusDropdown(null);
    } catch (error) {
      console.error('Error updating status:', error);
      setUpdateError({ 
        scanId, 
        message: error.message || 'Failed to update status. Please try again.',
        details: error.details
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (scanId) => {
    try {
      setDeleting(scanId);
      setDeleteError(null);

      const response = await fetch(`/api/job_scans/${scanId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error?.message || 'Failed to delete job application');
      }

      // Refresh the job scans data after successful deletion
      await fetchJobScans();
    } catch (error) {
      console.error('Error deleting job application:', error);
      setDeleteError({ 
        scanId, 
        message: error.message || 'Failed to delete. Please try again.',
        details: error.details
      });
    } finally {
      setDeleting(null);
    }
  };

  const clearError = (scanId) => {
    setUpdateError(null);
    setDeleteError(null);
  };

  const getStatusIcon = (status) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);
    if (!option) return null;
    const Icon = option.icon;
    return <Icon className={`w-5 h-5 ${option.color}`} />;
  };

  const JobDescriptionModal = () => {
    if (!selectedJobDescription) return null;

    const handleBackdropClick = (e) => {
      // Close the modal if clicking the backdrop (not the modal content)
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setSelectedJobDescription(null);
      }
    };

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" onClick={handleBackdropClick}>
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div ref={modalRef} className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Job Description</h3>
                <button
                  onClick={() => setSelectedJobDescription(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500 whitespace-pre-wrap">
                  {selectedJobDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 min-h-screen bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-gray-900">My Job Applications</h1>
            <p className="text-sm text-gray-500">Track and manage your job applications and scans</p>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium w-fit mt-1">
              {jobScans.length} {jobScans.length === 1 ? 'Application' : 'Applications'}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : jobScans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No job applications yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobScans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative" ref={dropdownRef}>
                          <button
                            onClick={() => {
                              setShowStatusDropdown(showStatusDropdown === scan.id ? null : scan.id);
                              clearError(scan.id);
                            }}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
                            disabled={updatingStatus === scan.id}
                          >
                            {updatingStatus === scan.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            ) : (
                              getStatusIcon(scan.application_status)
                            )}
                            <span className="text-sm text-gray-500">
                              {STATUS_OPTIONS.find(opt => opt.value === scan.application_status)?.label || 'Select Status'}
                            </span>
                          </button>
                          {showStatusDropdown === scan.id && (
                            <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                              {STATUS_OPTIONS.map((option) => {
                                const Icon = option.icon;
                                return (
                                  <button
                                    key={option.value}
                                    onClick={() => handleStatusChange(scan.id, option.value)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                    disabled={updatingStatus === scan.id}
                                  >
                                    <Icon className={`w-4 h-4 ${option.color}`} />
                                    <span>{option.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                          {updateError?.scanId === scan.id && (
                            <div className="absolute z-20 mt-1 w-48 bg-red-50 text-red-600 text-xs p-2 rounded-md">
                              <div className="flex justify-between items-center">
                                <span>{updateError.message}</span>
                                <button
                                  onClick={() => clearError(scan.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {scan.job_title || 'Untitled Position'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {scan.company || 'Unknown Company'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedJobDescription(scan.job_description)}
                          className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
                        >
                          <EyeIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-500">View Description</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button 
                            className="p-2 hover:bg-gray-100 rounded-md"
                            onClick={() => window.location.href = `/dashboard?job_scan_id=${scan.id}`}
                          >
                            <EyeIcon className="w-4 h-4 text-gray-500" />
                          </button>
                          <button 
                            className="p-2 hover:bg-gray-100 rounded-md hover:bg-red-50"
                            onClick={() => handleDelete(scan.id)}
                            disabled={deleting === scan.id}
                          >
                            {deleting === scan.id ? 
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div> :
                              <TrashIcon className="w-4 h-4 text-red-500" />
                            }
                          </button>
                          {deleteError?.scanId === scan.id && (
                            <div className="absolute mt-8 bg-red-50 text-red-600 text-xs p-2 rounded-md shadow-md">
                              <span>{deleteError.message}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <JobDescriptionModal />
    </div>
  );
} 