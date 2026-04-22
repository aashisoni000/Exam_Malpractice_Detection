import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { HomeIcon, BookOpenIcon, DocumentIcon } from '../components/Icons';
import { useAuth } from '../hooks/useAuth';

const studentNavItems = [
  { label: 'Dashboard', to: '/student-dashboard', icon: <HomeIcon /> },
  { label: 'My Exams', to: '/student-dashboard/my-exams', icon: <BookOpenIcon /> },
  { label: 'My Reports', to: '/student-dashboard/my-reports', icon: <DocumentIcon /> },
];

const StudentLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar navItems={studentNavItems} title="Student Portal" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="page-enter">
            <Outlet context={{ user }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
