import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

const ProtectedRoute = ({ allowedRole, children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullScreen />;
  
  console.log("ProtectedRoute check:", { 
    userExists: !!user, 
    userRole: user?.role, 
    requiredRole: allowedRole 
  });

  if (!user) {
    console.warn("ProtectedRoute: No user found, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    console.warn(`ProtectedRoute: Role mismatch (got ${user.role}, need ${allowedRole}), redirecting`);
    return <Navigate to={user.role === 'admin' ? '/admin-dashboard' : '/student-dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;
