"use client";

import React, { useState } from 'react';
import { FaPaste, FaCopy, FaTrash } from 'react-icons/fa';

export default function JobDescriptionInput({ value, onChange }) {
  const [isFocused, setIsFocused] = useState(false);

  // Handle paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      // Fallback: focus on textarea for manual paste
      document.getElementById('job-description-textarea')?.focus();
    }
  };

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Handle clear
  const handleClear = () => {
    onChange('');
  };

  // Count characters and words
  const characterCount = value.length;
  const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="space-y-3">
      {/* Textarea */}
      <div className="relative">
        <textarea
          id="job-description-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Paste the job description here...

Include details like:
• Job title and company
• Required skills and qualifications
• Job responsibilities
• Nice-to-have skills
• Company culture and values

The more details you provide, the better we can tailor your resume."
          rows={12}
          className={`
            w-full px-4 py-3 border rounded-lg resize-none
            focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
            ${isFocused ? 'border-black' : 'border-gray-300'}
            transition-colors duration-200
          `}
        />

        {/* Character/Word Count */}
        <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-white px-2 py-1 rounded">
          {characterCount} chars • {wordCount} words
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={handlePaste}
            className="flex items-center space-x-2 px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaPaste className="h-3 w-3" />
            <span>Paste</span>
          </button>

          {value && (
            <>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-2 px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaCopy className="h-3 w-3" />
                <span>Copy</span>
              </button>

              <button
                onClick={handleClear}
                className="flex items-center space-x-2 px-3 py-2 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <FaTrash className="h-3 w-3" />
                <span>Clear</span>
              </button>
            </>
          )}
        </div>

        {/* Status/Feedback */}
        <div className="text-xs text-gray-500">
          {value.length === 0 && (
            <span>Enter job description</span>
          )}
          {value.length > 0 && value.length < 100 && (
            <span className="text-amber-600">Add more details for better results</span>
          )}
          {value.length >= 100 && value.length < 500 && (
            <span className="text-blue-600">Good amount of detail</span>
          )}
          {value.length >= 500 && (
            <span className="text-green-600">Excellent detail level</span>
          )}
        </div>
      </div>

      {/* Tips */}
      {value.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-800">
            <strong>Tip:</strong> For best results, include the complete job posting with:
          </div>
          <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4">
            <li>• Required and preferred qualifications</li>
            <li>• Key responsibilities and duties</li>
            <li>• Technology stack or tools mentioned</li>
            <li>• Company culture or values</li>
          </ul>
        </div>
      )}
    </div>
  );
}