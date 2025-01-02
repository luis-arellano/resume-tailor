import React from 'react';
import { FaRegArrowAltCircleDown , FaRegTrashAlt} from 'react-icons/fa';
import { TEMPLATES } from '../resume_templates';


const ResumeControls = ({ onDownload, onDelete, selectedTemplate, onTemplateChange }) => {
  return (
    <div className="flex justify-between items-center">

      {/* Template selector */}
      <div className="flex items-center gap-2">
        <label htmlFor="template-select" className="text-sm text-gray-600">
          Template:
        </label>
        <select
          id="template-select"
          value={selectedTemplate}
          onChange={(e) => onTemplateChange(e.target.value)}
          className="select select-sm select-bordered w-full max-w-xs"
        >
          {Object.entries(TEMPLATES).map(([key, value]) => (
            <option key={value} value={value}>
              {key.charAt(0) + key.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onDownload}
          className="btn btn-netutral btn-sm normal-case flex items-center gap-2"
        >
          <FaRegArrowAltCircleDown className="mr-2" />
          Download
        </button>

        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-3 py-1 text-sm text-grey hover:text-red-600 transition-colors duration-200"
        >
          <FaRegTrashAlt className="w-4 h-4" />
        </button>
        </div>
    </div>
  );
};

export default ResumeControls;