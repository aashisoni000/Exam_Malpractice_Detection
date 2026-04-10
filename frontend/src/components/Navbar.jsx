// components/Navbar.jsx
// Top navigation bar. Receives user info and logout handler from parent layout.

import { ShieldCheckIcon } from './Icons';

const Navbar = ({ user, onLogout }) => {
  return (
    <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-900/50">
          <ShieldCheckIcon className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white tracking-tight">
          ExamGuard
          <span className="text-indigo-400 ml-1 text-xs font-normal uppercase tracking-widest">
            {user?.role}
          </span>
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* User badge */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <span className="text-sm text-slate-300 font-medium">{user?.name ?? 'User'}</span>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="text-sm text-slate-400 hover:text-red-400 transition-colors duration-200 
                     border border-slate-700/50 hover:border-red-500/40 px-3 py-1.5 rounded-lg"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
