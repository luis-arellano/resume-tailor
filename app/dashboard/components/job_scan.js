import React, { useEffect, useState, useRef, useContext } from 'react';
import { ModelContext} from '../context';
import { useResume } from '../context';
import apiClient from '@/libs/api';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";


const loader = <span className="loading loading-spinner loading-md"></span>

/**
 * Comoponent to Upload Resumes, Job descriptions, and trigger the analysis
 * @returns 
 */
function JobScan() {
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [resumes, setResumes] = useState([])
  const { refreshKey, setRefreshKey, selectedModel, setSelectedModel } = useResume(); //need to provide on context
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');


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
      const response = await apiClient.post('/resume/post', formData);

      if (response) {
        console.log('File uploaded successfully:', response);
        setUploadStatus('Resume uploaded successfully!');
        setRefreshKey(prevKey => prevKey + 1); // Update the refreshKey to trigger a refresh
      }
    }
    catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('Error uploading file');
    }
    finally {
      setLoading(false);
    }
  }

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

  const handleSubmit = (event) => {
    event.preventDefault();
    // Here you would handle the form submission to your backend or another service
    const resume_data = JSON.stringify(selectedModel['resume_data']);
    console.log('Submitting:', resume_data, jobDescription);

    try{
      const requestForm = new FormData();
      requestForm.append('resume',resume_data);
      requestForm.append('job_description', jobDescription);
      const response = apiClient.post('/resume/evaluate_resume', requestForm);
      console.log('LLM Response:', response);
    }
    catch (error) {
      console.error('Error evaluating resume:', error);
    }

    
  };

  return (
    <div className="flex w-full mx-auto bg-white rounded-lg shadow-md">

      <div className="flex flex-col w-2/4 p-4 border-r border-gray-300">

        {/* Container for the upload and list of uploaded resumes */}
        <div id="upload-container" className="relative bg-white p-2 m-2 rounded-lg border flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {loading ? 'Parsing your resume.' : 'Upload a new resume here'}.</p>
          <label htmlFor="file-input"
            className="text-xs text-grey border border-black shadow-md
           py-2 px-2 rounded-2xl cursor-pointer hover:duration-500 hover:bg-black hover:text-white">
            Upload Resume
          </label>
          <input type="file" className="hidden" id="file-input" onChange={event => handleFileChange(event)} />

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 border rounded-lg border text-gray-600 text-sm backdrop-blur-md bg-white/30 flex flex-col items-center justify-center">
              <div className='text-sm'> {loader} Parsing your Resume</div>
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
          <button type="submit" className="btn-special">Magic Scan</button>
        </div>
      </form>
    </div>
  );
}

export default JobScan;