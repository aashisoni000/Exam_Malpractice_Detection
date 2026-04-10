// App.jsx
// Root component. Sets up React Router routes and holds global user state.
// User state is managed here and passed down to layouts.
// TODO: Persist user in localStorage or React Context/Redux when scaling.

import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';

// ── Simple route guard ────────────────────────────────────────────────────────
// Redirects unauthenticated users to /login.
const ProtectedRoute = ({ user, allowedRole, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    // Wrong role — redirect to appropriate dashboard
    return <Navigate to={user.role === 'admin' ? '/admin-dashboard' : '/student-dashboard'} replace />;
  }
  return children;
};
// ──────────────────────────────────────────────────────────────────────────────

const App = () => {
  // Global user state — replace with Context/Redux as the app grows
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            user
              ? <Navigate to={user.role === 'admin' ? '/admin-dashboard' : '/student-dashboard'} replace />
              : <Login setUser={setUser} />
          }
        />

        {/* Student routes */}
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute user={user} allowedRole="student">
              <StudentLayout user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        >
          {/* Index route — renders StudentDashboard inside layout */}
          <Route index element={<StudentDashboard />} />
          {/* Future child routes:
          <Route path="exams"   element={<StudentExams />} />
          <Route path="reports" element={<StudentReports />} />
          */}
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute user={user} allowedRole="admin">
              <AdminLayout user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        >
          {/* Index route — renders AdminDashboard inside layout */}
          <Route index element={<AdminDashboard />} />
          {/* Future child routes:
          <Route path="students"       element={<StudentsPage />} />
          <Route path="exams"          element={<ExamsPage />} />
          <Route path="reports"        element={<ReportsPage />} />
          <Route path="suspicion-logs" element={<SuspicionLogsPage />} />
          */}
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
