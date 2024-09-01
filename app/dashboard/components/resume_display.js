import React, { useContext, useState, useEffect, useRef } from 'react';
import { FaPlus } from 'react-icons/fa';  // Import the plus icon
import _ from 'lodash';  // Import lodash
import { ModelContext } from '../context';
import apiClient from '@/libs/api';

/***
 * Renders a resume as a PDF form
 * - Have a loader
 * -have a delete button (probably on the job scan)
 * -download as pdf
 */
const ResumeDisplay = () => {
  const { selectedModel, contextLoading, updateModel, latestJobScan } = useContext(ModelContext);
  const [editableResume, setEditableResume] = useState(selectedModel);
  const refs = useRef({});

  useEffect(() => {
    if(selectedModel){
      console.log('selectedModel:', selectedModel);
      setEditableResume(selectedModel.resume_data);
    }
    
  }, [selectedModel]);

  const updateResumeField = (fieldPath, newValue) => {
    const updatedResume = _.cloneDeep(editableResume);
    _.set(updatedResume, fieldPath, newValue);
    setEditableResume(updatedResume);
    saveResumeToBackend(updatedResume);
  };

  const addResponsibility = (expIndex) => {
    const updatedResume = _.cloneDeep(editableResume);
    if (!updatedResume.Experience[expIndex].Responsibilities) {
      updatedResume.Experience[expIndex].Responsibilities = [];
    }
    updatedResume.Experience[expIndex].Responsibilities.push('New responsibility');
    setEditableResume(updatedResume);
    saveResumeToBackend(updatedResume);
  };

  const removeResponsibility = (expIndex, resIndex) => {
    const updatedResume = _.cloneDeep(editableResume);
    updatedResume.Experience[expIndex].Responsibilities.splice(resIndex, 1);
    setEditableResume(updatedResume);
    saveResumeToBackend(updatedResume);
  };

  const highlightKeywords = (text) => {
    if (!latestJobScan || !latestJobScan.keywords) return text;

    const keywords = latestJobScan.keywords.split(', ');
    const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
    return text.replace(regex, '<span class="bg-green-200">$1</span>');
  };


  const handleBlur = (fieldPath) => {
    console.log('hanlde BLUR!!');
    const ref = refs.current[fieldPath];
    const newValue = ref.textContent;  // Access the content directly from the DOM node
    const currentValue = _.get(editableResume, fieldPath);

    if (newValue !== currentValue) {

      if (newValue === '' && fieldPath.includes('Responsibilities')) {
        const [expIndex, resIndex] = fieldPath.match(/\d+/g).map(Number);
        removeResponsibility(expIndex, resIndex);
      } else {
        updateResumeField(fieldPath, newValue);
        // saveResumeToBackend(updatedResume);
        const highlightedContent = highlightKeywords(newValue);
        ref.innerHTML = highlightedContent;
    }
  }
  };

  const saveResumeToBackend = async (updatedResume) => {
    try{
      const formData = new FormData();
      formData.append('resume_json', JSON.stringify(updatedResume));
      formData.append('resume_id', selectedModel.id)
      const response = await apiClient.post('/resume/update_resume', formData);
      console.log('back end response:', response);

   } catch(err){
      console.error(err);
    }
    updateModel({...selectedModel, resume_data: updatedResume});
  }

  // Dynamically create contentEditable fields
  const createEditableField = (fieldPath, defaultValue, tag = 'div', className = "") => {
    if (!refs.current[fieldPath]) {
      refs.current[fieldPath] = React.createRef();
    }

    const Tag = tag;
    const content = _.get(editableResume, fieldPath) || defaultValue;
    const highlightedContent = highlightKeywords(content);

    return (
      <Tag
        key={fieldPath}
        ref={(el) => refs.current[fieldPath] = el}
        contentEditable
        onBlur={() => handleBlur(fieldPath)}
        className={`cursor-text hover:bg-blue-100 ${className}`}
        suppressContentEditableWarning={true}
        dangerouslySetInnerHTML={{ __html: highlightedContent }}
      >
        {/* {_.get(editableResume, fieldPath) || defaultValue} */}
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
          {createEditableField('ContactInformation.Email', 'No Email Provided', 'p')}
          {createEditableField('ContactInformation.Phone', 'No Phone Provided', 'p')}
          {createEditableField('ContactInformation.Location', 'No Location Provided', 'p', 'mb-2')}
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
                  <div className="text-xs text-gray-600">
                    {createEditableField(`Experience[${index}].StartDate`, '', 'span')} - {createEditableField(`Experience[${index}].EndDate`, '', 'span')}
                  </div>

                </div>
                {/* <p className="italic text-sm text-gray-600">{exp.Company}</p> */}
                {createEditableField(`Experience[${index}].Company`, '', 'p', 'italic text-sm text-gray-600')}  

                <br/>
                <p className="text-sm mb-2">{exp.Overview}</p>
                {exp.Responsibilities && (
                  <ul className="list-disc pl-5 text-sm">
                    {exp.Responsibilities.map((res, resIndex) => (
                      createEditableField(`Experience[${index}].Responsibilities[${resIndex}]`, '', 'li')
                    ))}
                    <li className="list-none">
                    
                      <button 
                        onClick={() => addResponsibility(index)}
                        className="xs-text hover:text-blue-500 transition-colors duration-200 flex items-center opacity-0 hover:opacity-100"
                      >
                          <span className="inline-flex items-center justify-center w-5 h-5 mr-2 border border-blue-500 rounded-full">
                            <FaPlus className="w-3 h-3" />
                          </span>
                        Add
                      </button>
                    </li>

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
                  {createEditableField(`Education[${index}].School`, '', 'h3', 'text-sm font-semibold')}
                  {createEditableField(`Education[${index}].Date`, '', 'span', 'text-xs text-gray-600')}
                </div>
                {createEditableField(`Education[${index}].Degree`, '', 'p', 'text-sm')}
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
                  {createEditableField(`Skills[${index}]`, '', 'span')}
                  {index < editableResume.Skills.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          </>
        )}

        {editableResume.Languages && editableResume.Languages.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-2">Languages</h2>
            <p className="text-sm">
              {editableResume.Languages.map((lang, index) => (
                <span key={index}>
                  {createEditableField(`Languages[${index}]`, '', 'span')}
                  {index < editableResume.Languages.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          </>
        )}
      </div>
    </div>
  );
};


export default ResumeDisplay;