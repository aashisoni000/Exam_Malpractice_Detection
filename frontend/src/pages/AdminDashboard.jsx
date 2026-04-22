import React from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  UsersIcon, BookOpenIcon, DocumentIcon,
  ExclamationTriangleIcon, ChartBarIcon,
} from '../components/Icons';
import Card, { CardContent } from '../components/ui/Card';

const stats = [
  { label: 'Total Students', value: '--', icon: <UsersIcon className="w-6 h-6 text-[#7FB77E]" /> },
  { label: 'Active Exams', value: '--', icon: <BookOpenIcon className="w-6 h-6 text-[#7FB77E]" /> },
  { label: 'Reports Generated', value: '--', icon: <DocumentIcon className="w-6 h-6 text-[#7FB77E]" /> },
  { label: 'Suspicion Flags', value: '--', icon: <ExclamationTriangleIcon className="w-6 h-6 text-[#7FB77E]" /> },
];

const AdminDashboard = () => {
  const { user } = useOutletContext();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, <span className="text-[#4d7f4c]">{user?.name ?? 'Admin'}</span>
        </h1>
        <p className="text-gray-500 mt-2 text-sm font-medium">
          System overview and malpractice detection control panel.
        </p>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="!p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wide">{s.label}</span>
                <div className="w-10 h-10 rounded-xl bg-[#e5efdf] flex items-center justify-center">
                  {s.icon}
                </div>
              </div>
              <p className="text-3xl font-extrabold text-gray-800">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System status banner */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            System Status
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'API Server', status: 'Online', bgColor: 'bg-green-100', dotColor: 'bg-green-500', textColor: 'text-green-700' },
              { label: 'Database', status: 'Connecting...', bgColor: 'bg-orange-100', dotColor: 'bg-orange-500', textColor: 'text-orange-700' },
              { label: 'Detection Engine', status: 'Active', bgColor: 'bg-blue-100', dotColor: 'bg-blue-500', textColor: 'text-blue-700' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4 bg-[#F5F0E6] border border-[#E6DECE] rounded-xl p-4 shadow-sm">
                <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                  <span className={`w-3 h-3 rounded-full ${item.dotColor} shadow-sm`}></span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{item.label}</p>
                  <p className={`text-xs font-semibold ${item.textColor}`}>{item.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
