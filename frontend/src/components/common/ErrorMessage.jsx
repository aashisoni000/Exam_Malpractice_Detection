import React from 'react';

const ErrorMessage = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-xl mb-4 text-sm font-medium animate-fadeIn">
      {message}
    </div>
  );
};

export default ErrorMessage;
