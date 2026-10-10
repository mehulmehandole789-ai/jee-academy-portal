import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner text="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    return <Navigate to={user.activeBatch ? '/student/dashboard' : '/enrollment-status'} replace />;
  }

  // Enrollment Status Guard for students:
  // If student has no approved batch, they must only access /enrollment-status until approved
  if (user.role === 'student' && !user.activeBatch && location.pathname !== '/enrollment-status') {
    return <Navigate to="/enrollment-status" replace />;
  }

  // If student has activeBatch and visits /enrollment-status, redirect to dashboard
  if (user.role === 'student' && user.activeBatch && location.pathname === '/enrollment-status') {
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
};
