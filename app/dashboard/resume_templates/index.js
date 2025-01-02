import React from 'react';

// Template registry
export const TEMPLATES = {
    CLASSIC: 'classic',
    MODERN: 'modern',
    // Add more templates as needed
  };
  
  // Map template IDs to their components
  export const templateMap = {
    [TEMPLATES.CLASSIC]: React.lazy(() => import('./ClassicTemplate')),
    [TEMPLATES.MODERN]: React.lazy(() => import('./ModernTemplate')),
  };