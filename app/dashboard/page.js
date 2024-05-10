"use client";
import ButtonAccount from "@/components/ButtonAccount";
import { useState } from 'react';
import apiClient from "@/libs/api";
import { useEffect } from "react";
import ResumeDisplay from "./components/resume_display";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [resumes, setResumes] = useState([]);

  // Get resumes associated with the user.
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await apiClient.get('/resume/get');
        setResumes(response); // Assuming the response data is the array of resumes
        console.log('RESPONSE: ', response);
      } catch (error) {
        console.error('Error fetching resumes:', error);
      }
    };
    fetchResumes();
  }, []);

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    console.log('UPLOAD FILE: ', uploadedFile);
    if (uploadedFile) {
      setFile(uploadedFile);
      // You might want to add additional checks for file type or size here
    }
  };


  const handleFileUpload = async (e) => {
    e.preventDefault(); // prevent the browser from doing a post/get request

    if (!file) {
      alert('Please select a file first!');
      return;
    }

    console.log(
      'RESUME', file
    )

    try {
      const formData = new FormData();
      formData.append('resume', file);

      
      // Assuming you have an endpoint to handle the file upload
      const response = await apiClient.post('/resume/post', formData);

      if (response) {
        console.log('File uploaded successfully:', response);
        alert('Resume uploaded successfully!');
      } 
    }
     catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  }

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-xl mx-auto space-y-8">
        <ButtonAccount />
        <h1 className="text-3xl md:text-4xl font-extrabold">Private Page</h1>
        <div>
          <input type="file" onChange={handleFileChange} accept=".pdf"/>
          <button onClick={handleFileUpload} className="ml-4 py-2 px-4 bg-blue-500 text-white font-bold rounded hover:bg-blue-700">
            Upload Resume
          </button>
        </div>
        {resumes.map(resume => (
        <ResumeDisplay key={resume.file_name} resume={resume.resume_data} />
      ))}
      </section>
    </main>
  );
}