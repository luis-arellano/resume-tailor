import React from 'react';
import { FaRegArrowAltCircleDown , FaRegTrashAlt} from 'react-icons/fa';


const ResumeControls = ({ onDownload, onDelete }) => {
  return (
    <div className="flex justify-end">
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
  );
};

export default ResumeControls;