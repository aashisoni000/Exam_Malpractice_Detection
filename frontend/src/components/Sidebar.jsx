// components/Sidebar.jsx
// Generic, configurable sidebar.
// Pass `navItems` array and `active` key to highlight the current route.

import { NavLink } from 'react-router-dom';

/**
 * @param {Array}  navItems  - [{ label, to, icon: ReactElement }]
 * @param {string} title     - Section title shown at top of sidebar
 */
const Sidebar = ({ navItems = [], title = 'Navigation' }) => {
  return (
    <aside className="w-64 shrink-0 h-full flex flex-col glass border-r border-white/5">
      {/* Sidebar header */}
      <div className="px-6 py-5 border-b border-white/5">
        <p className="text-xs uppercase tracking-widest text-slate-500 font-medium">{title}</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Sidebar footer */}
      <div className="px-6 py-4 border-t border-white/5">
        <p className="text-xs text-slate-600">ExamGuard v1.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
