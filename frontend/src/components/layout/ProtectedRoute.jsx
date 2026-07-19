import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

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

  const needsApproval = (user.role === 'STORE_ADMIN' || user.role === 'DELIVERY_PARTNER') && user.verificationStatus !== 'APPROVED';
  
  if (needsApproval && location.pathname !== '/pending') {
    return <Navigate to="/pending" replace />;
  }
  
  if (!needsApproval && location.pathname === '/pending') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
