import React, { useContext, useState, useEffect, useRef } from 'react';
import { FaPlus, FaDownload, FaRegTrashAlt } from 'react-icons/fa';  // Import the plus icon
import _ from 'lodash';  // Import lodash
import { ModelContext } from '../context';
import apiClient from '@/libs/api';
import ResumeControls from './resume_controls';
import { useReactToPrint } from 'react-to-print';
import { TEMPLATES, templateMap } from '../resume_templates';
import { Suspense } from 'react';

/***
 * Renders a resume as a PDF form
 * - Have a loader
 * -download as pdf
 */
const ResumeDisplay = () => {
  const { selectedModel, contextLoading, updateModel, latestJobScan, refreshModels } = useContext(ModelContext);
  const [editableResume, setEditableResume] = useState(selectedModel);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES.CLASSIC);

  const TemplateComponent = templateMap[selectedTemplate];

  const refs = useRef({});
  const resumeRef = useRef(null);

  useEffect(() => {
    if (selectedModel) {
      console.log('selectedModel:', selectedModel);
      setEditableResume(selectedModel?.resume_data);
    }

  }, [selectedModel]);

  const handlePrint = useReactToPrint({
    content: () => resumeRef.current,
  });

  const handleDeleteResume = async () => {
    if (window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      try{
        const response = await apiClient.delete(`/resumes/${selectedModel.id}`);
        setEditableResume(null); // clear local state
        updateModel(null); // clear context
        refreshModels(); // Trigger a refresh of the resume list
        console.log('response:', response);
      } catch (err) {
        console.error('Error deleting resume:', err);
      }
    }
  };

  // DO NOT USE - NOT READY FOR PRODUCTION. FEATUR IS MAGIC REWRITE OR REWRITE RESUME.
  // const handleRewriteResume = async () => {

  //   // Need to make sure that we have a resume and a job scan before we can enable this
  //   if (selectedModel && latestJobScan) {
  //     const formData = new FormData();
  //     formData.append('resume', JSON.stringify(selectedModel.resume_data));
  //     formData.append('keywords', latestJobScan.keywords);
  //     formData.append('job_description', latestJobScan.job_description);

  //     const response = await apiClient.post('/resume/rewrite', formData);
  //     console.log('response:', response);
  //   }
  //   else{
  //     console.log('No resume or job scan selected');
  //   }
  // }

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
    return (<div className='container mx-2'>
    <div className="m-2 a4-size flex flex-col items-center justify-center bg-gray-50">
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">Loading...</h2>
      <p className="text-gray-500 text-center max-w-md">
      </p>
    </div>
    </div>);
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
      <section className="bg-white border border-1 border-grey rounded-lg max-w-4xl mb-2 p-2 mx-auto">
        <ResumeControls 
          onDownload={handlePrint} 
          onDelete={handleDeleteResume}
          selectedTemplate={selectedTemplate}
          onTemplateChange={setSelectedTemplate}
          // onRewriteResume={handleRewriteResume}
        />
      </section>

      <div ref={resumeRef}>
        <Suspense fallback={<div>Loading template...</div>}>
          <TemplateComponent
            resumeData={editableResume}
            refs={refs}
            createEditableField={createEditableField}
            handleDelete={handleDelete}
            addItem={addItem}
          />
        </Suspense>
      </div>
    </div>
  );
};


export default ResumeDisplay;