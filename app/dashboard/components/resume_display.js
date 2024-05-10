import React from 'react';

const ResumeDisplay = ({ resume }) => {

return (
    <div className="bg-white p-6 shadow-md rounded-lg max-w-4xl mx-auto">
      <div className="border-b pb-4 mb-4">
        <h1 className="text-3xl font-bold">{resume.ContactInformation?.Name || 'No Name Provided'}</h1>
        <p className="text-sm">{resume.ContactInformation?.Email || 'No Email Provided'}</p>
        <p className="text-sm">{resume.ContactInformation?.Phone || 'No Phone Provided'}</p>
        <p className="text-sm mb-2">{resume.ContactInformation?.Location || 'No Location Provided'}</p>
        <p className="text-lg font-semibold">{resume.Position || 'No Position Provided'}</p>
      </div>

        {resume.Experience && resume.Experience.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mb-2">Work Experience</h2>
          {resume.Experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <p className="font-semibold">{exp.Title} at {exp.Company}</p>
              <p className="text-sm">{exp.Duration}</p>
              <p className="text-sm italic mb-1">{exp.Overview}</p>
              {exp.Responsibilities && (
              <ul className="list-disc list-inside">
              {exp.Responsibilities.map((res, resIndex) => <li key={resIndex} className="text-sm">{res}</li>)}
            </ul>

              )}

            </div>
          ))}
        </>
      )}

      {resume.Education && resume.Education.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mb-2">Education</h2>
          {resume.Education.map((edu, index) => (
            <div key={index} className="mb-4">
              <p className="font-semibold">{edu.Degree} - {edu.School}</p>
              <p className="text-sm">{edu.Duration}</p>
            </div>
          ))}
        </>
      )}

      {resume.Skills && resume.Skills.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mb-2">Skills</h2>
          <ul className="list-disc list-inside">
            {resume.Skills.map((skill, index) => <li key={index} className="text-sm">{skill}</li>)}
        </ul>
          </>
        )}
      
      {resume.Languages && resume.Languages.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mb-2">Languages</h2>
          <ul className="list-disc list-inside">
            {resume.Languages.map((lang, index) => <li key={index} className="text-sm">{lang}</li>)}
        </ul>
          </>
        )}
    </div>
  );
};


export default ResumeDisplay;