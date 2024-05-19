import React, { useState } from 'react';

function JobScan() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');

  const handleResumeUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleJobDescriptionChange = (event) => {
    setJobDescription(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Here you would handle the form submission to your backend or another service
    console.log('Submitting:', resumeFile, jobDescription);
  };

  return (
    <div className=" w-screen mx-auto p-5 bg-white rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="flex justify-between p-5 space-x-4">
            <div className="flex flex-col space-y-2">
                <label className="block">
                Resume
                <input type="file" onChange={handleResumeUpload} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </label>
                {resumeFile && <div className="text-sm text-gray-600">{resumeFile.name}</div>}
            </div>
            <div className="flex flex-col space-y-2">
                <label className="block">
                Job description
                <textarea
                    value={jobDescription}
                    onChange={handleJobDescriptionChange}
                    placeholder="Job description..."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
                </label>
            </div>
            <div className="flex flex-col space-y-2">
                <button type="submit" className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700">Power Edit</button>
                <button type="button" onClick={() => { setResumeFile(null); setJobDescription(''); }} className="px-4 py-2 font-bold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100">Cancel</button>
            </div>
            </form>

    </div>

  );
}

export default JobScan;