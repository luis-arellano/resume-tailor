"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import apiClient from "@/libs/api";
import toast from "react-hot-toast";
import { 
  DocumentIcon, 
  EyeIcon, 
  TrashIcon,
  ArrowUpTrayIcon 
} from '@heroicons/react/24/outline';

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const response = await apiClient.get('/resumes');
          if (response) {
            // Sort resumes by created_at date, most recent first
            const sortedResumes = [...response].sort((a, b) => 
              new Date(b.created_at) - new Date(a.created_at)
            );
            setResumes(sortedResumes);
          } else {
            console.log('No valid data found in response');
            setResumes([]);
          }
        }
      } catch (error) {
        console.error('Error fetching resumes:', error);
        setResumes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, [supabase]);

  const handleFileChange = async (event) => {
    setUploadLoading(true);
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      try {
        const formData = new FormData();
        formData.append('resume', uploadedFile);

        const response = await apiClient.post('/resume/post_new_resume', formData);
        if (response && response.resume_id) {
          toast.success('Resume upload initiated. Processing...', {
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
          });
          // Refresh the resumes list and maintain sorting
          const updatedResumes = await apiClient.get('/resumes');
          const sortedResumes = [...updatedResumes].sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          );
          setResumes(sortedResumes);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error('Error uploading file', {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      } finally {
        setUploadLoading(false);
        event.target.value = ''; // Reset the file input
      }
    }
  };

  const handleDelete = async (resumeId) => {
    if (window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      try {
        await apiClient.post(`/resume/delete?resume_id=${resumeId}`);
        setResumes(resumes.filter(resume => resume.id !== resumeId));
      } catch (error) {
        console.error('Error deleting resume:', error);
      }
    }
  };

  return (
    <div className="p-8 min-h-screen bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col gap-6">
            {/* Title Section */}
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-gray-900">My Resumes</h1>
                <p className="text-sm text-gray-500">Manage and view your uploaded resumes.

                </p>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium w-fit">
                  {resumes.length} {resumes.length === 1 ? 'Resume' : 'Resumes'}
                </span>
              </div>

              {/* Upload Section */}
              <div className="flex flex-col gap-2">
                <div id="upload-container" className="relative bg-white p-3 rounded-lg border flex items-center justify-between w-fit">
                  <p className="text-sm text-gray-600">
                    {uploadLoading ? 'Uploading your resume...' : 'Upload a new resume here'}
                  </p>
                  <label 
                    htmlFor="file-input"
                    className="text-xs text-grey border border-black shadow-md py-2 px-4 rounded-2xl cursor-pointer hover:duration-500 hover:bg-black hover:text-white ml-4"
                  >
                    {uploadLoading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      'Upload Resume'
                    )}
                  </label>
                  <input 
                    type="file" 
                    className="hidden" 
                    id="file-input" 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                  />

                  {/* Loading Overlay */}
                  {uploadLoading && (
                    <div className="absolute inset-0 border rounded-lg border text-gray-600 text-sm backdrop-blur-md bg-white/30 flex flex-col items-center justify-center">
                      <div className='text-sm'>Uploading your Resume</div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 text-right">Supported formats: PDF, DOC, DOCX</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No resumes uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className={`flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors shadow-sm ${
                  resume.status === 'processing' ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    {resume.status === 'processing' ? (
                      <span className="loading loading-spinner loading-xs text-gray-500"></span>
                    ) : (
                      <DocumentIcon className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-medium text-sm truncate ${resume.status === 'processing' ? 'text-gray-400' : ''}`}>
                      {resume.file_name || 'Untitled Resume'}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {new Date(resume.created_at).toLocaleDateString()}
                      {resume.status === 'processing' && (
                        <span className="ml-2 text-blue-500">Processing...</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2 ml-4">
                  {resume.status !== 'processing' && (
                    <>
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-md"
                        onClick={() => window.location.href = `/dashboard?resume_id=${resume.id}`}
                      >
                        <EyeIcon className="w-4 h-4 text-gray-500" />
                      </button>
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-md"
                        onClick={() => handleDelete(resume.id)}
                      >
                        <TrashIcon className="w-4 h-4 text-gray-500" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 