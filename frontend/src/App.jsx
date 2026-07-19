import { BrowserRouter, Routes, Route } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { StorePage } from './pages/StorePage';
import { CartPage } from './pages/CartPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { PendingApprovalPage } from './pages/auth/PendingApprovalPage';
import { CitySelectorModal } from './components/ui/CitySelectorModal';
import { LandingPage } from './pages/LandingPage';

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
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/pending" element={<PendingApprovalPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/track" element={<TrackOrderPage />} />
            </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </CityProvider>
    </AuthProvider>
  );
}

export default App;
