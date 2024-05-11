import React from 'react';

const ResumeDisplay = ({ resume }) => {

  return (
    // <div className="bg-white p-3 shadow-md rounded-lg max-w-4xl mb-2 mx-auto">
    <div className="a4-size">


      <div className="flex bg-zinc-50 p-4 mb-4">
        {/* <!-- Left Column for Name and Position --> */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{resume.ContactInformation?.Name || 'No Name Provided'}</h1>
          <p className="text-lg font-semibold">{resume.Position || null}</p>
        </div>

        {/* <!-- Right Column for Contact Information --> */}
        <div className="flex-1 text-right text-xs italic">
          <p >{resume.ContactInformation?.Email || 'No Email Provided'}</p>
          <p >{resume.ContactInformation?.Phone || 'No Phone Provided'}</p>
          <p className=" mb-2">{resume.ContactInformation?.Location || 'No Location Provided'}</p>
        </div>
      </div>

      <div className='p-4'>
        {resume.Experience && resume.Experience.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-2">Work Experience</h2>
            {resume.Experience.map((exp, index) => (
              <div key={index} className="mb-6">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-lg font-semibold">{exp.Title}</h3>
                  <span className="text-xs text-gray-600">{exp.Duration}</span>
                </div>
                <p className="italic tx-sm text-gray-600">{exp.Company}</p>
                <br/>
                <p className="text-sm mb-2">{exp.Overview}</p>
                {exp.Responsibilities && (
                  <ul className="list-disc pl-5 text-sm">
                    {exp.Responsibilities.map((res, resIndex) => (
                      <li key={resIndex}>{res}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}

        {resume.Education && resume.Education.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-2">Education</h2>
            {resume.Education.map((edu, index) => (
              <div key={index} className="mb-4">

                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-semibold">{edu.School}</h3>
                  <span className="text-xs text-gray-600">{edu.Duration}</span>
                </div>

                <p className="text-sm">{edu.Degree}</p>
              </div>
            ))}
          </>
        )}

        {resume.Skills && resume.Skills.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-2">Skills</h2>
            <p className="text-sm">
              {resume.Skills.map((skill, index) => (
                <span key={index}>
                  {skill}{index < resume.Skills.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          </>
        )}

        {resume.Languages && resume.Languages.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-2">Languages</h2>
            {resume.Languages.map((lang, index) => (
              <span key={index}>
                {lang}{index < resume.Languages.length - 1 ? ', ' : ''}
              </span>
            ))}
          </>
        )}
      </div>
    </div>
  );
};


export default ResumeDisplay;