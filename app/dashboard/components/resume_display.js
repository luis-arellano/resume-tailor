import React, { useContext, useState, useEffect, useRef } from 'react';
import { FaPlus, FaDownload, FaRegTrashAlt } from 'react-icons/fa';  // Import the plus icon
import _ from 'lodash';  // Import lodash
import { ModelContext } from '../context';
import apiClient from '@/libs/api';
import ResumeControls from './resume_controls';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import Image from 'next/image';

/***
 * Renders a resume as a PDF form
 * - Have a loader
 * -download as pdf
 */
const ResumeDisplay = () => {
  const { selectedModel, contextLoading, updateModel, latestJobScan } = useContext(ModelContext);
  const [editableResume, setEditableResume] = useState(selectedModel);
  const refs = useRef({});
  const resumeRef = useRef(null);

  useEffect(() => {
    if (selectedModel) {
      console.log('selectedModel:', selectedModel);
      setEditableResume(selectedModel.resume_data);
    }

  }, [selectedModel]);

  const handlePrint = useReactToPrint({
    content: () => resumeRef.current,
  });

  const updateResumeArray = (arrayPath, action, index = null) => {
    const updatedResume = _.cloneDeep(editableResume);
    const array = _.get(updatedResume, arrayPath);

    if (action === 'add') {
      if (!array) {
        _.set(updatedResume, arrayPath, []);
      }
      _.get(updatedResume, arrayPath).push(`New ${arrayPath.split('.').pop().slice(0, -1)}`);
    } else if (action === 'remove' && index !== null) {
      _.get(updatedResume, arrayPath).splice(index, 1);
    }

    setEditableResume(updatedResume);
    saveResumeToBackend(updatedResume);
  };

  const addItem = (arrayPath) => updateResumeArray(arrayPath, 'add');
  const removeItem = (arrayPath, index) => updateResumeArray(arrayPath, 'remove', index);

  const updateResumeField = (fieldPath, newValue) => {
    const updatedResume = _.cloneDeep(editableResume);
    _.set(updatedResume, fieldPath, newValue);
    setEditableResume(updatedResume);
    saveResumeToBackend(updatedResume);
  };

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  };

  const highlightKeywords = (text) => {
    if (!latestJobScan || !latestJobScan.keywords) return text;

    const keywords = latestJobScan.keywords.split(', ').map(keyword => escapeRegExp(keyword));
    const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
    return text.replace(regex, '<span class="keyword-highlight">$1</span>');
  };


  const handleBlur = (fieldPath) => {
    const ref = refs.current[fieldPath];
    const newValue = ref.textContent;  // Access the content directly from the DOM node
    const currentValue = _.get(editableResume, fieldPath);

    if (newValue !== currentValue) {
      updateResumeField(fieldPath, newValue);
      const highlightedContent = highlightKeywords(newValue);
      ref.innerHTML = highlightedContent;
    }
  };


  const handleDelete = (arrayPath, index) => {
    removeItem(arrayPath, index);
  };

  const saveResumeToBackend = async (updatedResume) => {
    try {
      const formData = new FormData();
      formData.append('resume_json', JSON.stringify(updatedResume));
      formData.append('resume_id', selectedModel.id)
      const response = await apiClient.post('/resume/update_resume', formData);
      console.log('back end response:', response);

    } catch (err) {
      console.error(err);
    }
    updateModel({ ...selectedModel, resume_data: updatedResume });
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
      </Tag>
    );
  };

  if (contextLoading) {
    return <p>Loading...</p>;
  }

  if (!editableResume) {
    return (
      <div className='container mx-2'>
      <div className="m-2 a4-size flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Resume Selected</h2>
        <p className="text-gray-500 text-center max-w-md">
        ☝️ First upload a resume
        </p>
      </div>
      </div>

    );
  }

  return (

    <div className='container mx-2'>

      {/* Resume Controls */}
      <section className="bg-white border border-1 border-grey rounded-lg max-w-4xl mb-2 p-2 mx-auto">
        <ResumeControls onDownload={handlePrint} />
      </section>


      <div ref={resumeRef} className="a4-size">

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

                    {createEditableField(`Experience[${index}].Company`, '', 'h3', 'text-lg font-semibold')}
                    <div className="text-xs text-gray-600">
                      {createEditableField(`Experience[${index}].StartDate`, '', 'span')} - {createEditableField(`Experience[${index}].EndDate`, '', 'span')}
                    </div>
                  </div>
                  {createEditableField(`Experience[${index}].Title`, '', 'h4', 'italic text-base text-gray-800')}

                  {createEditableField(`Experience[${index}].Overview`, '', 'p', 'text-sm mb-1')}
                  {exp.Responsibilities && (
                    <ul className="list-disc pl-5 text-sm">
                      {exp.Responsibilities.map((res, resIndex) => (
                        <li key={resIndex} className="relative mb-2 group">
                          {createEditableField(`Experience[${index}].Responsibilities[${resIndex}]`, '', 'span')}
                          <button
                      onClick={() => handleDelete(`Experience[${index}].Responsibilities`, resIndex)}
                      className="absolute buttom-0 right-0 text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaRegTrashAlt className="w-3 h-3" />
                    </button>
                        </li>
                      ))}

                      <li className="list-none">

                        <button
                          onClick={() => addItem(`Experience[${index}].Responsibilities`)}
                          className=" no-print xs-text h-0 mb mt-2 hover:text-blue-500 transition-colors duration-200 flex items-center opacity-20 hover:opacity-100"
                        >
                          <span className=" no-print inline-flex items-center justify-center w-3 h-3 mr-2 border border-blue-500 rounded-full">
                            <FaPlus className="w-2 h-2" />
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
              <p className="text-xs">
                {editableResume.Skills.map((skill, index) => (
                  <span key={index}>
                    {createEditableField(`Skills[${index}]`, '', 'span')}
                    {index < editableResume.Skills.length - 1 ? ', ' : ''}
                  </span>
                ))}
                <button
                  onClick={() => addItem('Skills')}
                  className="no-print xs-text mb-0 hover:text-blue-500 transition-colors duration-200 flex items-center opacity-20 hover:opacity-100"
                >
                  <span className="no-print inline-flex items-center justify-center w-3 h-3 mr-2 border border-blue-500 rounded-full">
                    <FaPlus className="w-2 h-2" />
                  </span>
                  Add Skill
                </button>
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

          {editableResume.OtherInformation && editableResume.OtherInformation.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-2">Other</h2>
              <p className="text-sm">
                {editableResume.OtherInformation.map((info, index) => (
                  <span key={index}>
                    {createEditableField(`OtherInformation[${index}]`, '', 'span')}
                    {index < editableResume.OtherInformation.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


export default ResumeDisplay;