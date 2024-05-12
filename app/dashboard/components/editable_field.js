import React, { useState, useEffect, useRef} from 'react';

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
  const inputRef = useRef(null); // Create a ref for the input element


  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    setLocalValue(e.target.value);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus(); // Focus the input when it becomes editable
    }
  }, [isEditing]); // Dependency on isEditing ensures this runs only when it changes

  const handleTagClick = (e) => {
    setIsEditing(true);
    // Delay setting focus to ensure the input is visible and rendered
    setTimeout(() => {
      if (inputRef.current) {
        const range = document.createRange();
        const sel = window.getSelection();
        try {
          // Attempt to set the selection to the point where the user clicked
          range.setStart(inputRef.current.childNodes[0], e.nativeEvent.offsetX);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        } catch (error) {
          // Fallback to setting focus at the end of the input if the above fails
          inputRef.current.focus();
        }
      }
    }, 0);
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
        ref={inputRef}
        className= {`editable-textarea ${className}`}
        value={localValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        autoFocus
      />
    ) : (
      <input
        ref={inputRef}
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
    <Tag onClick={handleTagClick} className={className} style={{ cursor: 'text'}}>
      {value || placeholder}
    </Tag>
  );
};

export default EditableField;