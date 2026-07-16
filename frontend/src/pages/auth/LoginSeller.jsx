import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../app/authSlice';
import { authApi } from '../../api/authApi';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

const LoginSeller = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!email || !password) {
        setError('Email address and password are required');
        setLoading(false);
        return;
      }
      const payload = { email: email.trim().toLowerCase(), password };
      const data = await authApi.login(payload);
      dispatch(setAuth({
        token: data.token,
        role: data.role,
        userId: data.userId,
        storeId: data.storeId
      }));

      if (data.role === 'STORE_ADMIN') {
        navigate('/shopkeeper/dashboard');
      } else {
        dispatch(setAuth(null));
        setError('Unauthorized access. This portal is for Shopkeepers only.');
        setLoading(false);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
          Shopkeeper Portal
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
          {t('auth.sellerLoginSubtitle') || 'Sign in to manage your store'}
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleLogin}>
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              id="login-seller-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="name@example.com"
              className="block w-full pl-12 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-2xl dark:bg-gray-800 dark:border-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPw ? 'text' : 'password'}
              id="login-seller-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              className="block w-full pl-12 pr-12 py-3.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-2xl dark:bg-gray-800 dark:border-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="text-right -mt-2">
            <Link to="/forgot-password" className="text-xs font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-extrabold rounded-2xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 transition shadow-lg shadow-emerald-500/10"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              Verifying...
            </>
          ) : (
            'Verify & Login'
          )}
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
          Don't have an account?{' '}
          <Link to="/register/seller" className="font-extrabold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-350">
            Register
          </Link>
        </p>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-4 py-3 rounded-2xl border border-red-100 dark:border-red-900/20 text-center font-medium">
            {error}
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginSeller;