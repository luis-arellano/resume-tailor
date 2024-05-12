import React, { useState, useEffect } from 'react';
import EditableField from './editable_field';

const ResumeDisplay = ({ resume }) => {

  const [editableResume, setEditableResume] = useState(resume);
  const [editMode, setEditMode] = useState({});


  useEffect(() => {
    setEditableResume(resume);
  }, [resume]);

  const handleChange = (newValue, section, field) => {
    const updatedResume = {
      ...editableResume,
      [section]: {
        ...editableResume[section],
        [field]: newValue,
      },
    };
    setEditableResume(updatedResume);
    console.log('RESUME NOW: ', editableResume);
  };

  const handleBlur = (section, field) => {
    setEditMode({ ...editMode, [`${section}-${field}`]: false });
    // Optionally, update backend here
  };

  return (
    <div className="a4-size">

      <div className="flex bg-zinc-50 p-4 mb-4">
        {/* <!-- Left Column for Name and Position --> */}
        <div className="flex-1">
  
          <EditableField 
            className="text-2xl font-bold"
            value={editableResume.ContactInformation.Name}
            onValueChange={(newValue) => handleChange(newValue, 'ContactInformation', 'Name')}
            placeholder='No Name'
            tag='h1'
          />
          
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


                  {/* <h3 className="text-lg font-semibold">{exp.Title}</h3> */}
                  <EditableField 
                    className="text-lg font-semibold"
                    value={exp.Title}
                    onValueChange={(newValue) => handleChange(newValue, 'Experience', 'Title')}
                    placeholder='No Name'
                    tag='h3'
                  />


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