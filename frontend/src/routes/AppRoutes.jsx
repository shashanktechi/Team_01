import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import AuthLayout from '../layouts/AuthLayout';
import AppLayout from '../layouts/AppLayout';
import ProtectedRoute from './ProtectedRoute';

import Landing from '../pages/Landing';

// Auth pages
import LoginCustomer from '../pages/auth/LoginCustomer';
import RegisterCustomer from '../pages/auth/RegisterCustomer';
import LoginSeller from '../pages/auth/LoginSeller';
import RegisterSeller from '../pages/auth/RegisterSeller';
import LoginDelivery from '../pages/auth/LoginDelivery';
import RegisterDelivery from '../pages/auth/RegisterDelivery';
import LoginAdmin from '../pages/auth/LoginAdmin';

// Customer pages
import Home from '../pages/customer/Home';
import StoreDetail from '../pages/customer/StoreDetail';
import Checkout from '../pages/customer/Checkout';
import OrderTracking from '../pages/customer/OrderTracking';
import OrderHistory from '../pages/customer/OrderHistory';
import CustomerProfile from '../pages/customer/Profile';

// Shopkeeper pages
import ShopkeeperDashboard from '../pages/shopkeeper/Dashboard';
import Orders from '../pages/shopkeeper/Orders';
import Inventory from '../pages/shopkeeper/Inventory';
import StoreProfile from '../pages/shopkeeper/StoreProfile';
import Products from '../pages/shopkeeper/Products';

// Delivery pages
import DeliveryDashboard from '../pages/delivery/Dashboard';
import TaskDetail from '../pages/delivery/TaskDetail';
import Earnings from '../pages/delivery/Earnings';

// Admin pages
import AdminDashboard from '../pages/admin/Dashboard';
import StoreApproval from '../pages/admin/StoreApproval';
import Users from '../pages/admin/Users';

const RoleRedirect = () => {
  const { role, isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  switch (role) {
    case 'CUSTOMER': return <Navigate to="/" replace />;
    case 'STORE_ADMIN': return <Navigate to="/shopkeeper/dashboard" replace />;
    case 'DELIVERY_PARTNER': return <Navigate to="/delivery/dashboard" replace />;
    case 'SYSTEM_ADMIN': return <Navigate to="/admin/dashboard" replace />;
    default: return <Navigate to="/login" replace />;
  }
};

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* Public Landing Page */}
      <Route path="/login" element={<Landing />} />

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login/customer" element={<LoginCustomer />} />
        <Route path="/register/customer" element={<RegisterCustomer />} />
        <Route path="/login/seller" element={<LoginSeller />} />
        <Route path="/register/seller" element={<RegisterSeller />} />
        <Route path="/login/delivery" element={<LoginDelivery />} />
        <Route path="/register/delivery" element={<RegisterDelivery />} />
        <Route path="/login/admin" element={<LoginAdmin />} />
        {/* Keep the old routes for backward compatibility during transition (optional)
        <Route path="/login" element={<Navigate to="/login/customer" replace />} />
        <Route path="/register" element={<Navigate to="/register/customer" replace />} />
        */}
      </Route>

      {/* Customer routes */}
      <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/store/:storeId" element={<StoreDetail />} />
          <Route path="/customer/checkout" element={<Checkout />} />
          <Route path="/customer/track/:orderId" element={<OrderTracking />} />
          <Route path="/customer/orders" element={<OrderHistory />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />
        </Route>
      </Route>

      {/* Shopkeeper routes */}
      <Route element={<ProtectedRoute allowedRoles={['STORE_ADMIN']} />}>
        <Route element={<AppLayout />}>
          <Route path="/shopkeeper/dashboard" element={<ShopkeeperDashboard />} />
          <Route path="/shopkeeper/orders" element={<Orders />} />
          <Route path="/shopkeeper/inventory" element={<Inventory />} />
          <Route path="/shopkeeper/products" element={<Products />} />
          <Route path="/shopkeeper/profile" element={<StoreProfile />} />
        </Route>
      </Route>

      {/* Delivery routes */}
      <Route element={<ProtectedRoute allowedRoles={['DELIVERY_PARTNER']} />}>
        <Route element={<AppLayout />}>
          <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
          <Route path="/delivery/task/:orderId" element={<TaskDetail />} />
          <Route path="/delivery/earnings" element={<Earnings />} />
          <Route path="/delivery/profile" element={<CustomerProfile />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={['SYSTEM_ADMIN']} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/approvals" element={<StoreApproval />} />
          <Route path="/admin/approvals/:storeId" element={<StoreApproval />} />
          <Route path="/admin/users" element={<Users />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
