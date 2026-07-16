import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../app/authSlice';
import { authApi } from '../../api/authApi';
import { Mail, Loader2, User, Key, Check, Phone, MessageSquare } from 'lucide-react';

const RegisterCustomer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=details, 4=success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
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
      if (!name || !phone || !password) {
        setError('All fields are required');
        setLoading(false);
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        setLoading(false);
        return;
      }
      const payload = {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        phone: phone.trim(),
        password,
        role: 'CUSTOMER',
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
          Create Account
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
          Sign up as a customer to order fresh items
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
                  id="register-customer-email"
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
                  id="register-customer-otp"
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
          <>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="register-customer-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
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
                  id="register-customer-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 890"
                  className="block w-full pl-12 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-2xl dark:bg-gray-800 dark:border-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Key size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  id="register-customer-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="block w-full pl-12 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-2xl dark:bg-gray-800 dark:border-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
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
                  Registering...
                </>
              ) : (
                'Register'
              )}
            </button>
          </>
        )}

        {step === 4 && (
          <div className="text-center space-y-4 py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 mx-auto">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Registration Successful!
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Your customer account has been created successfully.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center py-3.5 px-6 text-sm font-extrabold rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/15 transition-all"
            >
              Go to Homepage
            </Link>
          </div>
        )}

        {step !== 4 && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
            Already have an account?{' '}
            <Link to="/login/customer" className="font-extrabold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-350">
              Sign In
            </Link>
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-4 py-3 rounded-2xl border border-red-100 dark:border-red-900/20 text-center font-medium">
            {error}
          </p>
        )}
      </form>
    </div>
  );
};

export default RegisterCustomer;