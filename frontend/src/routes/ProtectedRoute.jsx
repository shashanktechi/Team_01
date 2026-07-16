import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role) && role !== 'SYSTEM_ADMIN') {
    // Redirect to correct dashboard based on actual role
    switch (role) {
      case 'CUSTOMER': return <Navigate to="/" replace />;
      case 'STORE_ADMIN': return <Navigate to="/shopkeeper/dashboard" replace />;
      case 'DELIVERY_PARTNER': return <Navigate to="/delivery/dashboard" replace />;
      case 'SYSTEM_ADMIN': return <Navigate to="/admin/dashboard" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
