import React, { useState, useEffect } from 'react';

const EditableField = ({ 
    value,
    onValueChange,
    tag: Tag = 'div',
    isTextArea = false,
    placeholder = '',
    className = '',
    inputClassName = ''
    }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onValueChange(localValue);
  };

  const handleFocus = (e) => {
    e.target.select();  // Automatically select text on focus
  };

  if (isEditing) {
    return isTextArea ? (
      <textarea
        className= {`editable-textarea ${className}`}
        value={localValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        autoFocus
      />
    ) : (
      <input
        className={`editable-input ${className}`}
        type="text"
        value={localValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        autoFocus
      />
    );
  }

  return (
    <Tag onClick={() => setIsEditing(true)} className={className} style={{ cursor: 'text'}}>
      {value || placeholder}
    </Tag>
  );
};

export default EditableField;