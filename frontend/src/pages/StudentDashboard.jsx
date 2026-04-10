// pages/StudentDashboard.jsx
// Main landing page for student role after login.

import { useOutletContext } from 'react-router-dom';
import { BookOpenIcon, DocumentIcon, ChartBarIcon } from '../components/Icons';

const stats = [
  { label: 'Exams Taken', value: '--', icon: <BookOpenIcon className="w-5 h-5 text-indigo-400" />, color: 'indigo' },
  { label: 'Reports', value: '--', icon: <DocumentIcon className="w-5 h-5 text-violet-400" />, color: 'violet' },
  { label: 'Suspicion Flags', value: '--', icon: <ChartBarIcon className="w-5 h-5 text-amber-400" />, color: 'amber' },
];

const StudentDashboard = () => {
  const { user } = useOutletContext();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, <span className="text-indigo-400">{user?.name ?? 'Student'}</span> 👋
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Here's an overview of your exam activity.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm font-medium">{s.label}</span>
              <div className={`w-9 h-9 rounded-xl bg-${s.color}-500/15 flex items-center justify-center`}>
                {s.icon}
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-600">Data will populate when connected to DB</p>
          </div>
        ))}
      </div>

      {/* Placeholder content areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Exams */}
        <div className="card">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpenIcon className="w-4 h-4 text-indigo-400" />
            Recent Exams
          </h2>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-3">
              <BookOpenIcon className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm">No exams yet</p>
            <p className="text-slate-600 text-xs mt-1">Your exam history will appear here</p>
          </div>
        </div>

        {/* My Reports */}
        <div className="card">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <DocumentIcon className="w-4 h-4 text-violet-400" />
            My Reports
          </h2>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-3">
              <DocumentIcon className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm">No reports generated</p>
            <p className="text-slate-600 text-xs mt-1">Suspicion reports will appear here</p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="mt-6 flex items-start gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-5 py-4">
        <span className="text-indigo-400 mt-0.5 shrink-0">ℹ</span>
        <p className="text-sm text-indigo-300/80">
          This is the initial scaffold. Student exam data, IP logs, and real-time detection
          features will be integrated in upcoming sprints.
        </p>
      </div>
    </div>
  );
};

export default StudentDashboard;
