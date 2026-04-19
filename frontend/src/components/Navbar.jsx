import React from 'react';
import { ShieldCheckIcon } from './Icons';

const Navbar = ({ user, onLogout }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[#7FB77E] rounded-xl flex items-center justify-center shadow-md">
          <ShieldCheckIcon className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-gray-800 tracking-tight text-lg">
          ExamGuard
          <span className="text-[#a8d7a7] ml-2 text-xs font-bold uppercase tracking-widest">
            {user?.role}
          </span>
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        {/* User badge */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#f1f6ef] border border-[#d4e6d0] flex items-center justify-center text-[#558b54] text-sm font-bold shadow-sm">
            {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <span className="text-sm text-gray-600 font-medium">{user?.name ?? 'User'}</span>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="text-sm font-medium text-gray-500 hover:text-[#7FB77E] transition-colors duration-200 
                     border border-gray-200 hover:border-[#7FB77E] px-4 py-1.5 rounded-xl bg-gray-50 hover:bg-white shadow-sm"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
