import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { BookOpenIcon, DocumentIcon, ChartBarIcon } from '../components/Icons';
import Card, { CardContent } from '../components/ui/Card';

const stats = [
  { label: 'Exams Taken', value: '--', icon: <BookOpenIcon className="w-6 h-6 text-[#7FB77E]" /> },
  { label: 'Reports', value: '--', icon: <DocumentIcon className="w-6 h-6 text-[#7FB77E]" /> },
  { label: 'Suspicion Flags', value: '--', icon: <ChartBarIcon className="w-6 h-6 text-[#7FB77E]" /> },
];

const StudentDashboard = () => {
  const { user } = useOutletContext();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, <span className="text-[#4d7f4c]">{user?.name ?? 'Student'}</span> 👋
        </h1>
        <p className="text-gray-500 mt-2 text-sm font-medium">Here's an overview of your exam activity.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="!p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 text-sm font-bold uppercase tracking-wide">{s.label}</span>
                <div className="w-10 h-10 rounded-xl bg-[#e5efdf] flex items-center justify-center shadow-sm">
                  {s.icon}
                </div>
              </div>
              <p className="text-3xl font-extrabold text-gray-800 mb-1">{s.value}</p>
              <p className="text-xs text-gray-400 font-medium">Data will populate when connected</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder content areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Exams */}
        <Card>
          <CardContent>
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <BookOpenIcon className="w-5 h-5 text-[#7FB77E]" />
              Recent Exams
            </h2>
            <div className="flex flex-col items-center justify-center py-10 text-center bg-[#F5F0E6] rounded-xl border border-[#E6DECE] shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#f1f6ef] flex items-center justify-center mb-4">
                <BookOpenIcon className="w-6 h-6 text-[#7FB77E]" />
              </div>
              <p className="text-gray-600 font-semibold">No exams yet</p>
              <p className="text-gray-400 text-sm mt-1">Your exam history will appear here</p>
            </div>
          </CardContent>
        </Card>

        {/* My Reports */}
        <Card>
          <CardContent>
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <DocumentIcon className="w-5 h-5 text-[#7FB77E]" />
              Recent Reports
            </h2>
            <div className="flex flex-col items-center justify-center py-10 text-center bg-[#F5F0E6] rounded-xl border border-[#E6DECE] shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#f1f6ef] flex items-center justify-center mb-4">
                <DocumentIcon className="w-6 h-6 text-[#7FB77E]" />
              </div>
              <p className="text-gray-600 font-semibold">No reports generated</p>
              <p className="text-gray-400 text-sm mt-1">Suspicion reports will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info banner */}
      <div className="mt-8 flex items-start gap-3 bg-[#f1f6ef] border border-[#d4e6d0] rounded-2xl px-6 py-5 shadow-sm">
        <span className="text-[#558b54] mt-0.5 shrink-0 text-lg">💡</span>
        <p className="text-sm font-medium text-[#4d7f4c] leading-relaxed">
          This is the initial scaffold. Student exam data, IP logs, and real-time detection
          features will be integrated in upcoming sprints.
        </p>
      </div>
    </div>
  );
};

export default StudentDashboard;
