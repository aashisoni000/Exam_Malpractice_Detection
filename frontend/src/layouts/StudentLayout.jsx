// layouts/StudentLayout.jsx
// Wraps all student pages with Navbar + Sidebar.
// Outlet renders the matched child route.

import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { HomeIcon, BookOpenIcon, DocumentIcon } from '../components/Icons';

const studentNavItems = [
  { label: 'Dashboard', to: '/student-dashboard', icon: <HomeIcon /> },
  { label: 'My Exams', to: '/student-dashboard/exams', icon: <BookOpenIcon /> },
  { label: 'My Reports', to: '/student-dashboard/reports', icon: <DocumentIcon /> },
];

const StudentLayout = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar navItems={studentNavItems} title="Student Portal" />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          <div className="page-enter">
            <Outlet context={{ user }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
