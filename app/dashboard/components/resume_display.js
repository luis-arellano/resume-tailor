import React, { useContext, useState, useEffect, useRef } from 'react';
import _ from 'lodash';  // Import lodash
import { ModelContext } from '../context';

const ResumeDisplay = ({  }) => {
  const { selectedModel, contextLoading } = useContext(ModelContext);
  const [editableResume, setEditableResume] = useState(selectedModel);
  const refs = useRef({});

  useEffect(() => {
    if(selectedModel){
      setEditableResume(selectedModel.resume_data);
    }
    
  }, [selectedModel]);


  const handleBlur = (fieldPath) => {
    const ref = refs.current[fieldPath];
    const newValue = ref.textContent;  // Access the content directly from the DOM node
    const currentValue = _.get(editableResume, fieldPath);

    if (newValue !== currentValue) {
      const updatedResume = _.cloneDeep(editableResume);
      _.set(updatedResume, fieldPath, newValue);
      setEditableResume(updatedResume);
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

  if (contextLoading) {
    return <p>Loading...</p>;
  }

  if (!editableResume) {
    return <p>No resume selected</p>;
  }

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
          <p >{editableResume.ContactInformation?.Email || 'No Email Provided'}</p>
          <p >{editableResume.ContactInformation?.Phone || 'No Phone Provided'}</p>
          <p className=" mb-2">{editableResume.ContactInformation?.Location || 'No Location Provided'}</p>
        </div>
      </div>

      <div className='p-4'>
        {editableResume.Experience && editableResume.Experience.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-2">Work Experience</h2>
            {editableResume.Experience.map((exp, index) => (
              <div key={index} className="mb-6">
                <div className="flex justify-between items-baseline">

                  {createEditableField(`Experience[${index}].Title`, '', 'p', 'text-lg font-semibold')}  

                  {/* <span className="text-xs text-gray-600">{exp.Duration}</span> */}
                  <span className="text-xs text-gray-600">{exp.StartDate} - {exp.EndDate}</span>

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

        {editableResume.Education && editableResume.Education.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-2">Education</h2>
            {editableResume.Education.map((edu, index) => (
              <div key={index} className="mb-4">

                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-semibold">{edu.School}</h3>
                  {/* <span className="text-xs text-gray-600">{edu.Duration}</span> */}
                  <span className="text-xs text-gray-600">{edu.Date}</span>

                </div>

                <p className="text-sm">{edu.Degree}</p>
              </div>
            ))}
          </>
        )}

        {editableResume.Skills && editableResume.Skills.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-2">Skills</h2>
            <p className="text-sm">
              {editableResume.Skills.map((skill, index) => (
                <span key={index}>
                  {skill}{index < editableResume.Skills.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          </>
        )}

        {editableResume.Languages && editableResume.Languages.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-2">Languages</h2>
            {editableResume.Languages.map((lang, index) => (
              <span key={index}>
                {lang}{index < editableResume.Languages.length - 1 ? ', ' : ''}
              </span>
            ))}
          </>
        )}
      </div>
    </div>
  );
};


export default ResumeDisplay;