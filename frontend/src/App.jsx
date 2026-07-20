import { BrowserRouter, Routes, Route } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { RoleProtectedRoute } from './components/layout/RoleProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { StorePage } from './pages/StorePage';
import { CartPage } from './pages/CartPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProfilePage } from './pages/ProfilePage';
import { PendingApprovalPage } from './pages/auth/PendingApprovalPage';
import { CitySelectorModal } from './components/ui/CitySelectorModal';
import { LandingPage } from './pages/LandingPage';
import { SystemAdminDashboard } from './pages/dashboards/SystemAdminDashboard';
import { StoreAdminDashboard } from './pages/dashboards/StoreAdminDashboard';
import { DeliveryDashboard } from './pages/dashboards/DeliveryDashboard';

import { CityProvider } from './context/CityContext';

function App() {
  return (
    <AuthProvider>
      <CityProvider>
        <CartProvider>
          <BrowserRouter>
            <CitySelectorModal />
            <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route element={<MainLayout />}>
              <Route path="/stores" element={<HomePage />} />
              <Route path="/store/:id" element={<StorePage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/pending" element={<PendingApprovalPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/track" element={<TrackOrderPage />} />
              <Route element={<RoleProtectedRoute role="SYSTEM_ADMIN" />}>
                <Route path="/admin-dashboard/*" element={<SystemAdminDashboard />} />
              </Route>
              <Route element={<RoleProtectedRoute role="STORE_ADMIN" />}>
                <Route path="/store-dashboard/*" element={<StoreAdminDashboard />} />
              </Route>
              <Route element={<RoleProtectedRoute role="DELIVERY_PARTNER" />}>
                <Route path="/delivery-dashboard/*" element={<DeliveryDashboard />} />
              </Route>
            </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </CityProvider>
    </AuthProvider>
  );
}

export default App;
