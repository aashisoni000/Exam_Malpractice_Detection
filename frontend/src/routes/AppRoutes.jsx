import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Pages - Auth
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';

// Pages - Student
import StudentDashboard from '../pages/StudentDashboard';
import MyExams from '../pages/MyExams';
import MyReports from '../pages/MyReports';
import TakeExam from '../pages/TakeExam';

// Pages - Admin
import AdminDashboard from '../pages/AdminDashboard';
import Students from '../pages/Students';
import Exams from '../pages/Exams';
import Reports from '../pages/Reports';
import SuspicionLogs from '../pages/SuspicionLogs';
import CreateExam from '../pages/CreateExam';

// Layouts
import StudentLayout from '../layouts/StudentLayout';
import AdminLayout from '../layouts/AdminLayout';

// Guards
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={
          user
            ? <Navigate to={user.role === 'admin' ? '/admin-dashboard' : '/student-dashboard'} replace />
            : <Login />
        }
      />

      {/* ─── Student Routes ──────────────────────────────────── */}
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="my-exams" element={<MyExams />} />
        <Route path="my-reports" element={<MyReports />} />
        <Route path="take-exam/:examId" element={<TakeExam />} />
      </Route>

      {/* ─── Admin Routes ────────────────────────────────────── */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="exams" element={<Exams />} />
        <Route path="reports" element={<Reports />} />
        <Route path="suspicion-logs" element={<SuspicionLogs />} />
        <Route path="create-exam" element={<CreateExam />} />
      </Route>

      {/* Fallbacks */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
