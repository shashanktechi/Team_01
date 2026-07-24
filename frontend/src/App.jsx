import { BrowserRouter, Routes, Route } from 'react-router';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { RoleProtectedRoute } from './components/layout/RoleProtectedRoute';
import { CityProvider } from './context/CityContext';
import { EnvironmentProvider } from './context/EnvironmentContext';

// ── Eagerly loaded (needed immediately for any route) ──────────────────────
import { CitySelectorModal } from './components/ui/CitySelectorModal';
// ── Lazy-loaded pages (code split — Three.js stays out of initial bundle) ──
// Core flows load fast; 3D assets stream in while the user reads content.
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const StorePage = lazy(() => import('./pages/StorePage').then(m => ({ default: m.StorePage })));
const CartPage = lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage').then(m => ({ default: m.TrackOrderPage })));
const OrdersPage = lazy(() => import('./pages/OrdersPage').then(m => ({ default: m.OrdersPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const PendingApprovalPage = lazy(() => import('./pages/auth/PendingApprovalPage').then(m => ({ default: m.PendingApprovalPage })));
const ProfileSettingsPage = lazy(() => import('./pages/ProfileSettingsPage').then(m => ({ default: m.ProfileSettingsPage })));
const SystemAdminDashboard = lazy(() => import('./pages/dashboards/SystemAdminDashboard').then(m => ({ default: m.SystemAdminDashboard })));
const StoreAdminDashboard = lazy(() => import('./pages/dashboards/StoreAdminDashboard').then(m => ({ default: m.StoreAdminDashboard })));
const DeliveryDashboard = lazy(() => import('./pages/dashboards/DeliveryDashboard').then(m => ({ default: m.DeliveryDashboard })));

// ── Simple inline loading fallback ────────────────────────────────────────
const PageSuspenseFallback = () => (
  <div
    className="fixed inset-0 flex items-center justify-center"
    style={{ background: '#FFFFFF' }}
  >
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: '3px solid rgba(22, 163, 74, 0.15)',
        borderTopColor: 'var(--color-primary, #16A34A)',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CityProvider>
        <CartProvider>
          <EnvironmentProvider>
            <BrowserRouter>
              <CitySelectorModal />
              <Suspense fallback={<PageSuspenseFallback />}>
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
                    <Route path="/profile/settings" element={<ProfileSettingsPage />} />
                    <Route path="/pending" element={<PendingApprovalPage />} />
                  </Route>

                  <Route element={<RoleProtectedRoute allowedRoles={['SYSTEM_ADMIN']} />}>
                    <Route path="/admin-dashboard/*" element={<SystemAdminDashboard />} />
                  </Route>
                  <Route element={<RoleProtectedRoute allowedRoles={['STORE_ADMIN']} />}>
                    <Route path="/store-dashboard/*" element={<StoreAdminDashboard />} />
                  </Route>
                  <Route element={<RoleProtectedRoute allowedRoles={['DELIVERY_PARTNER']} />}>
                    <Route path="/delivery-dashboard/*" element={<DeliveryDashboard />} />
                  </Route>

                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/track/:orderId" element={<TrackOrderPage />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </EnvironmentProvider>
        </CartProvider>
      </CityProvider>
    </AuthProvider>
  );
}

export default App;
