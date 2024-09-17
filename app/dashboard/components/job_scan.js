import React, { useEffect, useState, useRef, useContext } from 'react';
import { LoadContext } from '../context';
import apiClient from '@/libs/api';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ModelContext } from '../context';
import { useInterval } from '../../hooks/useInterval';


const loader = <span className="loading loading-spinner loading-md"></span>

/**
 * Comoponent to Upload Resumes, Job descriptions, and trigger the analysis
 * @returns 
 */
function JobScan() {
  const [loading, setLoading] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [resumes, setResumes] = useState([])
  const { refreshKey, setRefreshKey, selectedModel, setSelectedModel, setLatestJobScan, refreshJobScan, jobScanStatus, setJobScanStatus } = LoadContext();

  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobScanId, setJobScanId] = useState(null);
  const [processingResumeId, setProcessingResumeId] = useState(null);


  const handleResumeSelect = (index) => {
    setSelectedModel(resumes[index]);
    const supabase = createClientComponentClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            localStorage.setItem(`selectedModel_${session.user.id}`, JSON.stringify(resumes[index]));
        }
    });
};

  const handleFileChange = (event) => {
    setLoading(true);
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setResumeFile(uploadedFile);
      event.target.value = '';
      // Additional checks for file type or size here
    }
  };

  useEffect(() => {
    if (resumeFile) {
      handleFileUpload();
    }
  }, [resumeFile]);


  const handleFileUpload = async (e) => {
    // e.preventDefault(); // prevent the browser from doing a post/get request

    if (!resumeFile) {
      alert('Please select a file first!');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      // Call the api endpoint
      // const response = await apiClient.post('/resume/post', formData);
      const response = await apiClient.post('/resume/post_new_resume', formData);

      if (response && response.resume_id) {
        setUploadStatus('Resume upload initiated. Processing...');
        setProcessingResumeId(response.resume_id);
        // setProcessing(true);
        // setUploadStatus('Resume uploaded successfully!');
        // setRefreshKey(prevKey => prevKey + 1); // Update the refreshKey to trigger a refresh
      }
    }
    catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('Error uploading file');
    }
    finally {
      setLoading(false);
    }
  };

  useInterval(
    async () => {
      if (processingResumeId) {
        try {
          const response = await apiClient.get(`/resume/get_resume_status?resume_id=${processingResumeId}`);
          if (response.status === 'completed') {
            setProcessingResumeId(null);
            setUploadStatus('Resume processed successfully!');
            setRefreshKey(prevKey => prevKey + 1); // Trigger resume list refresh
          }
        } catch (error) {
          console.error('Error checking resume status:', error);
          // setProcessing(false);
          setProcessingResumeId(null);
          setUploadStatus('Error processing resume');
        }
      }
    },
    processingResumeId ? 2000 : null
  );

  const loadResumes = async () => {
    try {
      const response = await apiClient.get("/resume/get")
      return response
    } catch (e) {
      console.error(e?.message);
    } finally {
      console.log('Finished Loading Resumes');
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    (async () => {
      const fetchedResumes = await loadResumes();
      // sort models by most recently created
      fetchedResumes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setResumes(fetchedResumes);
    })();
  }, [refreshKey]); // Context can trigger a reresh

  const handleJobDescriptionChange = (event) => {
    setJobDescription(event.target.value);
  };

  // Submit the job description and resume for evaluation
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoadingAnalysis(true);
    setJobScanStatus('processing');
    const resume_data = JSON.stringify(selectedModel['resume_data']);

    try{
      const requestForm = new FormData();
      requestForm.append('resume',resume_data);
      requestForm.append('job_description', jobDescription);
      requestForm.append('resume_id', selectedModel.id);

      // const response = await apiClient.post('/resume/evaluate_resume', requestForm);
      const response = await apiClient.post('/resume/new_job_scan', requestForm);
      setJobScanId(response.job_scan_id);
      setJobScanStatus('processing');

    } catch (error) {
      console.error('Error evaluating resume:', error);
      setJobScanStatus('error');
    } finally {
      setLoadingAnalysis(false);
    }  
  };

  // Check the status of the job scan every couple of seconds.
  useInterval(
    async () => {
        if (jobScanId) {
            try {
                const response = await apiClient.get(`/resume/get_job_scan_status?job_scan_id=${jobScanId}`);
                setJobScanStatus(response.status);
                if (response.status === 'completed') {
                    setLatestJobScan(response.result);
                    setJobScanId(null);
                    setLoadingAnalysis(false);
                }
                if (response.status === 'error') {
                  setJobScanId(null);
                  setLoadingAnalysis(false);
                }
            } catch (error) {
                console.error('Error checking job status:', error);
                setJobScanStatus('error');
                setJobScanId(null);
                setLoadingAnalysis(false);
            }
        }
    },
    jobScanStatus === 'processing' ? 2500 : null
);



  return (
    <div className="flex w-full mx-auto bg-white border border-1 border-grey rounded-lg shadow-md">

      <div className="flex flex-col w-2/4 p-4 border-r border-gray-300">

        {/* Container for the upload and list of uploaded resumes */}
        <div id="upload-container" className="relative bg-white p-2 m-2 rounded-lg border flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {loading ? 'Parsing your resume.' : processingResumeId ? 'Processing your resume.' : 'Upload a new resume here'}.</p>
          <label htmlFor="file-input"
            className="text-xs text-grey border border-black shadow-md
           py-2 px-2 rounded-2xl cursor-pointer hover:duration-500 hover:bg-black hover:text-white">
            Upload Resume
          </label>
          <input type="file" className="hidden" id="file-input" onChange={event => handleFileChange(event)} />

          {/* Loading Overlay */}
          {(loading || processingResumeId) && (
            <div className="absolute inset-0 border rounded-lg border text-gray-600 text-sm backdrop-blur-md bg-white/30 flex flex-col items-center justify-center">
              <div className='text-sm'> {loader} {loading ? 'Uploading' : 'Processing'} your Resume</div>
              </div>
          )}

        </div>

        {/* List of Uploaded resumes */}
        <ul className="overflow-y-auto m-2">
          {resumes.map((resume, index) => (
            <li key={index} className="p-2 text-xs rounded-lg border m-1 hover:bg-gray-100">
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">{resume.file_name} - {new Date(resume.created_at).toLocaleDateString()}</span>
                  <input type="radio" name="selected-resume" className="radio radio-sm"
                       checked={selectedModel ? selectedModel.file_name === resume.file_name: false}
                       onChange={() => handleResumeSelect(index)}
                  />
                </label>
              </div>
            </li>
          ))}
        </ul>

      </div>

      {/* Container for the job description and Magic Scan */}
      <form onSubmit={handleSubmit} className="flex flex-col justify-between p-5 space-y-4 w-2/3">
        <div>
          <label className="block text-sm">
            Job description
            <textarea
              value={jobDescription}
              onChange={handleJobDescriptionChange}
              placeholder="Paste the job description here..."
              className="mt-1 block w-full 
              px-3 py-2 border border-gray-300 
              rounded-md shadow-sm 
              focus:outline-none
              focus:ring-black
              focus:border-black"
            ></textarea>
          </label>
        </div>
        <div>
          {/* TODO Fix the style here. I don't like it */}
          <button type="submit" className="btn-special"> Magic Resume
            {loadingAnalysis ? loader : ''}</button>
        </div>
      </form>
    </div>
  );
}

export default JobScan;