import React from 'react';
import { FaRegArrowAltCircleDown } from 'react-icons/fa';

const ResumeControls = ({ onDownload }) => {
  return (
    <div className="flex justify-end">
      <button
        onClick={onDownload}
        className="btn btn-netutral btn-sm normal-case flex items-center gap-2"
      >
        <FaRegArrowAltCircleDown className="mr-2" />
        Download
      </button>
    </div>
  );
};

export default ResumeControls;