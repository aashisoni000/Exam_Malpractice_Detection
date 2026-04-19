import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

const ProtectedRoute = ({ allowedRole, children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullScreen />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin-dashboard' : '/student-dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;
