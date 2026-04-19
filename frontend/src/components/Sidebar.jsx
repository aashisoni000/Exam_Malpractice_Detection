import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ navItems = [], title = 'Navigation' }) => {
  return (
    <aside className="w-64 shrink-0 h-full flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300">
      {/* Sidebar header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <p className="text-xs uppercase tracking-widest text-[#7FB77E] font-bold">{title}</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-4 flex flex-col gap-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-[#e5efdf] text-[#4d7f4c] shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`
            }
          >
            {item.icon && <span className="shrink-0 w-5 h-5">{item.icon}</span>}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Sidebar footer */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <p className="text-xs text-gray-400 font-medium tracking-wide">ExamGuard v1.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
