// pages/AdminDashboard.jsx
// Main landing page for admin role after login.

import { useOutletContext } from 'react-router-dom';
import {
  UsersIcon, BookOpenIcon, DocumentIcon,
  ExclamationTriangleIcon, ChartBarIcon,
} from '../components/Icons';

const stats = [
  { label: 'Total Students', value: '--', icon: <UsersIcon className="w-5 h-5 text-indigo-400" /> },
  { label: 'Active Exams', value: '--', icon: <BookOpenIcon className="w-5 h-5 text-emerald-400" /> },
  { label: 'Reports Generated', value: '--', icon: <DocumentIcon className="w-5 h-5 text-violet-400" /> },
  { label: 'Suspicion Flags', value: '--', icon: <ExclamationTriangleIcon className="w-5 h-5 text-red-400" /> },
];

const quickActions = [
  { label: 'View Students', desc: 'Browse all registered students', icon: <UsersIcon className="w-6 h-6 text-indigo-400" />, to: '/admin-dashboard/students' },
  { label: 'Manage Exams', desc: 'Create and schedule exams', icon: <BookOpenIcon className="w-6 h-6 text-emerald-400" />, to: '/admin-dashboard/exams' },
  { label: 'Suspicion Logs', desc: 'Review flagged activity', icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />, to: '/admin-dashboard/suspicion-logs' },
  { label: 'Analytics', desc: 'Charts and trend reports', icon: <ChartBarIcon className="w-6 h-6 text-amber-400" />, to: '/admin-dashboard/reports' },
];

const AdminDashboard = () => {
  const { user } = useOutletContext();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome, <span className="text-indigo-400">{user?.name ?? 'Admin'}</span> 🛡️
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          System overview and malpractice detection control panel.
        </p>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">{s.label}</span>
              <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center">
                {s.icon}
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((a) => (
          <a
            key={a.label}
            href={a.to}
            className="card hover:bg-white/5 transition-all duration-200 group cursor-pointer no-underline block"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-4 
                            group-hover:scale-110 transition-transform duration-200">
              {a.icon}
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">{a.label}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{a.desc}</p>
          </a>
        ))}
      </div>

      {/* System status banner */}
      <div className="card">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          System Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'API Server', status: 'Online', color: 'emerald' },
            { label: 'Database', status: 'Pending Config', color: 'amber' },
            { label: 'Detection Engine', status: 'Not Started', color: 'slate' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 bg-slate-800/40 rounded-xl p-3">
              <span className={`w-2.5 h-2.5 rounded-full bg-${item.color}-400 shrink-0`}></span>
              <div>
                <p className="text-xs font-medium text-slate-300">{item.label}</p>
                <p className={`text-xs text-${item.color}-400`}>{item.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
