// layouts/AdminLayout.jsx
// Wraps all admin pages with Navbar + Sidebar.
// Outlet renders the matched child route.

import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { HomeIcon, UsersIcon, BookOpenIcon, DocumentIcon, ExclamationTriangleIcon } from '../components/Icons';

const adminNavItems = [
  { label: 'Dashboard', to: '/admin-dashboard', icon: <HomeIcon /> },
  { label: 'Students', to: '/admin-dashboard/students', icon: <UsersIcon /> },
  { label: 'Exams', to: '/admin-dashboard/exams', icon: <BookOpenIcon /> },
  { label: 'Reports', to: '/admin-dashboard/reports', icon: <DocumentIcon /> },
  { label: 'Suspicion Logs', to: '/admin-dashboard/suspicion-logs', icon: <ExclamationTriangleIcon /> },
];

const AdminLayout = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar navItems={adminNavItems} title="Admin Panel" />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          <div className="page-enter">
            <Outlet context={{ user }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
