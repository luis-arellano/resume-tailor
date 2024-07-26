import React, { useRef, useEffect } from 'react';

// NOT FUNCTIONAL, NEED TO FIX THE REF

const EditableField = ({ fieldPath, defaultValue, handleBlur, tag: Tag = 'div', className = "" }) => {
  const ref = useRef(null); // Local ref

    useEffect(() => {
        if (ref.current) {
        handleBlur(ref.current, fieldPath);
        }
    }, [ref.current]);

  return (
    <Tag
      ref={ref}
      contentEditable
      onBlur={() => handleBlur(fieldPath)}
      className={`cursor-text hover:bg-blue-100 ${className}`}
      suppressContentEditableWarning={true}
    >
      {defaultValue}
    </Tag>
  );
};

export default EditableField;