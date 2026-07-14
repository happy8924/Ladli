import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, logisticsAllowed = false }) => {
  const { user, loading, isAdmin, isLogistics } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading-spinner">Loading...</div>; // Simple fallback
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (logisticsAllowed && !isAdmin && !isLogistics) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
