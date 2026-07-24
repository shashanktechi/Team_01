import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../context/AuthContext';

export function RoleProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboard
    if (user.role === 'SYSTEM_ADMIN') return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'STORE_ADMIN') return <Navigate to="/store-dashboard" replace />;
    if (user.role === 'DELIVERY_PARTNER') return <Navigate to="/delivery-dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
