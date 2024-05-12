import React, { useState, useEffect, useRef } from 'react';
import EditableField from './editable_field';
import _ from 'lodash';  // Import lodash


const ResumeDisplay = ({ resume }) => {

  const [editableResume, setEditableResume] = useState(resume);
  const refs = useRef({});


  useEffect(() => {
    setEditableResume(resume);
  }, [resume]);

  const handleBlur = (fieldPath) => {
    const ref = refs.current[fieldPath];
    const newValue = ref.textContent;  // Access the content directly from the DOM node
    const currentValue = _.get(editableResume, fieldPath);

    if (newValue !== currentValue) {
      const updatedResume = _.cloneDeep(editableResume);
      _.set(updatedResume, fieldPath, newValue);
      setEditableResume(updatedResume);
      console.log('Updated Resume:', updatedResume);
    }
  };

  // Dynamically create contentEditable fields
  const createEditableField = (fieldPath, defaultValue, tag = 'div', className = "") => {
    if (!refs.current[fieldPath]) {
      refs.current[fieldPath] = React.createRef();
    }

    const Tag = tag;

    return (
      <Tag
        key={fieldPath}
        ref={(el) => refs.current[fieldPath] = el}
        contentEditable
        onBlur={() => handleBlur(fieldPath)}
        className={`cursor-text hover:bg-blue-100 ${className}`}
        suppressContentEditableWarning={true}
      >
        {_.get(editableResume, fieldPath) || defaultValue}
      </Tag>
    );
  };

  return (
    <div className="a4-size">

      <div className="flex bg-zinc-50 p-4 mb-4">
        {/* <!-- Left Column for Name and Position --> */}
        <div className="flex-1">

          {createEditableField('ContactInformation.Name', 'No Name Provided', 'h1', 'text-2xl font-bold')}
          {createEditableField('ContactInformation.Position', '', 'p', 'text-sm text-gray-600')}          

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

                  {createEditableField(`Experience[${index}].Title`, '', 'p', 'text-lg font-semibold')}  

                  <span className="text-xs text-gray-600">{exp.Duration}</span>
                </div>
                {/* <p className="italic text-sm text-gray-600">{exp.Company}</p> */}
                {createEditableField(`Experience[${index}].Company`, '', 'p', 'italic text-sm text-gray-600')}  

                <br/>
                <p className="text-sm mb-2">{exp.Overview}</p>
                {exp.Responsibilities && (
                  <ul className="list-disc pl-5 text-sm">
                    {exp.Responsibilities.map((res, resIndex) => (
                      // <li key={resIndex}>{res}</li>
                      createEditableField(`Experience[${index}].Responsibilities[${resIndex}]`, '', 'li')
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