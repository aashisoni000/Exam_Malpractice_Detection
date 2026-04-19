import React from 'react';

const Loader = ({ fullScreen = false }) => {
  const loaderCore = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-[#7FB77E] rounded-full animate-spin"></div>
      <span className="text-gray-500 font-medium text-sm">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {loaderCore}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-8">
      {loaderCore}
    </div>
  );
};

export default Loader;
