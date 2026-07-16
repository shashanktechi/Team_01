import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../app/authSlice';
import { authApi } from '../../api/authApi';
import { useTranslation } from 'react-i18next';
import { Mail, Loader2, User, Lock, Eye, EyeOff, MapPin, Check, Phone, MessageSquare } from 'lucide-react';

const RegisterSeller = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=details, 4=done
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    storeName: '',
    storeAddress: '',
    storeLat: '12.9716',
    storeLng: '77.5946',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.sendOtp(email.trim());
      setStep(2);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) {
      setError('OTP is required');
      return;
    }
    setStep(3);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!form.name || !form.phone || !form.password || !form.storeName || !form.storeAddress || !form.storeLat || !form.storeLng) {
        setError('All fields are required');
        setLoading(false);
        return;
      }
      const payload = {
        email: email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        name: form.name.trim(),
        role: 'STORE_ADMIN',
        storeName: form.storeName.trim(),
        storeAddress: form.storeAddress.trim(),
        storeLat: parseFloat(form.storeLat),
        storeLng: parseFloat(form.storeLng),
        otp: otp.trim()
      };
      const data = await authApi.register(payload);
      dispatch(setAuth({
        token: data.token,
        role: data.role,
        userId: data.userId,
        storeId: data.storeId
      }));

      setStep(4);
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({ ...f, storeLat: pos.coords.latitude.toFixed(6), storeLng: pos.coords.longitude.toFixed(6) })),
      () => setError('Location access denied')
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
          Register Store
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
          {t('auth.sellerRegisterSubtitle') || 'Register your store on QuickCart to start selling'}
        </p>
      </div>

      <form className="space-y-5" onSubmit={step === 2 ? handleVerifyOtp : (step === 3 ? handleRegister : null)}>
        {step === 1 && (
          <>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="register-seller-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="block w-full pl-12 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-2xl dark:bg-gray-800 dark:border-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                We will send a 6-digit verification code to this email address.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-extrabold rounded-2xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 transition shadow-lg shadow-emerald-500/10"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Sending OTP...
                </>
              ) : (
                'Send OTP Code'
              )}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                OTP Verification Code
              </label>
              <div className="relative">
                <MessageSquare size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="register-seller-otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  className="block w-full pl-12 pr-4 py-3.5 text-sm font-mono text-center tracking-widest text-gray-900 bg-white border border-gray-200 rounded-2xl dark:bg-gray-800 dark:border-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-extrabold rounded-2xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 transition shadow-lg shadow-emerald-500/10"
            >
              Verify OTP Code
            </button>
          </>
        )}

        {step === 3 && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  id="register-seller-name"
                  className="block w-full pl-12 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-2xl dark:bg-gray-800 dark:border-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 234 567 890"
                  id="register-seller-phone"
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
                  name="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  id="register-seller-password"
                  type={showPw ? 'text' : 'password'}
                  className="block w-full pl-12 pr-12 py-3.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-2xl dark:bg-gray-800 dark:border-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-4 mt-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Store Info</span>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Store Name
                </label>
                <input
                  name="storeName"
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  placeholder="Fresh Mart"
                  id="register-seller-storeName"
                  className="block w-full px-4 py-3 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-2xl dark:bg-gray-800 dark:border-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Store Address
                </label>
                <input
                  name="storeAddress"
                  value={form.storeAddress}
                  onChange={(e) => setForm({ ...form, storeAddress: e.target.value })}
                  placeholder="123 Main St, Area"
                  id="register-seller-storeAddress"
                  className="block w-full px-4 py-3 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-2xl dark:bg-gray-800 dark:border-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Latitude
                  </label>
                  <input
                    name="storeLat"
                    value={form.storeLat}
                    onChange={(e) => setForm({ ...form, storeLat: e.target.value })}
                    id="register-seller-storeLat"
                    type="number"
                    step="0.000001"
                    className="block w-full px-4 py-3 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-2xl dark:bg-gray-800 dark:border-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Longitude
                  </label>
                  <input
                    name="storeLng"
                    value={form.storeLng}
                    onChange={(e) => setForm({ ...form, storeLng: e.target.value })}
                    id="register-seller-storeLng"
                    type="number"
                    step="0.000001"
                    className="block w-full px-4 py-3 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-2xl dark:bg-gray-800 dark:border-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGetLocation}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 transition-all"
              >
                <MapPin size={16} /> Fetch Current Location
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 mt-6 border border-transparent text-sm font-extrabold rounded-2xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 transition shadow-lg shadow-emerald-500/10"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Register Store'
              )}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="text-center space-y-4 py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 mx-auto">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Registration Pending Approval
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Your store registration has been submitted. An administrator will review and approve your store shortly.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center py-3.5 px-6 text-sm font-extrabold rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/15 transition-all"
            >
              Go to Login
            </Link>
          </div>
        )}

        {step !== 4 && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 font-medium mt-4">
            Already have an account?{' '}
            <Link to="/login/seller" className="font-extrabold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-350">
              Sign In
            </Link>
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-4 py-3 rounded-2xl border border-red-100 dark:border-red-900/20 text-center font-medium mt-4">
            {error}
          </p>
        )}
      </form>
    </div>
  );
};

export default RegisterSeller;