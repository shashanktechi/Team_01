import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { Mail, Lock, CheckCircle, AlertTriangle, Loader2, Eye, EyeOff, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (step === 1) {
        if (!email) {
          setError('Email is required');
          setLoading(false);
          return;
        }
        await authApi.forgotPassword(email.trim().toLowerCase());
        setSuccess('A password reset code has been sent to your email.');
        setStep(2);
      } else if (step === 2) {
        if (otp.length !== 6) {
          setError('Please enter a 6-digit OTP');
          setLoading(false);
          return;
        }
        const data = await authApi.verifyResetOtp(email.trim().toLowerCase(), otp.trim());
        setResetToken(data.resetToken);
        setSuccess('OTP verified. Please enter your new password.');
        setStep(3);
      } else if (step === 3) {
        if (newPassword.length < 8) {
          setError('Password must be at least 8 characters long');
          setLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await authApi.resetPassword(email.trim().toLowerCase(), resetToken, newPassword);
        setSuccess('Password reset successful. Redirecting to login...');
        setStep(4);
        setTimeout(() => {
          navigate('/login/seller');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setSuccess('A new password reset code has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (step === 4) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <CheckCircle size={48} className="text-emerald-500 animate-bounce" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Reset Successful</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          Your password has been reset successfully. Redirecting you to the login page...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
          {step === 1 ? 'Forgot Password?' : step === 2 ? 'Verify Reset Code' : 'Set New Password'}
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
          {step === 1 
            ? 'Enter your email to receive a password reset code' 
            : step === 2 
            ? `Enter the 6-digit verification code sent to ${email}`
            : 'Choose a strong password containing at least 8 characters'}
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {step === 1 && (
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="block w-full pl-12 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-2xl dark:bg-gray-800 dark:border-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Verification Code
            </label>
            <div className="relative">
              <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setOtp(val.slice(0, 6));
                }}
                placeholder="000000"
                maxLength="6"
                required
                className="block w-full pl-12 pr-4 py-3.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-2xl dark:bg-gray-800 dark:border-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-center tracking-widest font-bold text-lg"
              />
            </div>
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
              >
                Resend code
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength="8"
                  required
                  className="block w-full pl-12 pr-12 py-3.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-2xl dark:bg-gray-800 dark:border-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="block w-full pl-12 pr-12 py-3.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-2xl dark:bg-gray-800 dark:border-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (step === 2 && otp.length !== 6) || (step === 3 && (newPassword.length < 8 || newPassword !== confirmPassword))}
          className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-extrabold rounded-2xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 transition shadow-lg shadow-emerald-500/10"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              Processing...
            </>
          ) : step === 1 ? (
            <>
              <Send size={18} className="mr-2" />
              Send Code
            </>
          ) : step === 2 ? (
            'Verify Code'
          ) : (
            'Reset Password'
          )}
        </button>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-4 py-3 rounded-2xl border border-red-100 dark:border-red-900/20 text-center font-medium flex items-center justify-center gap-2">
            <AlertTriangle size={18} />
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 px-4 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 text-center font-medium flex items-center justify-center gap-2">
            <CheckCircle size={18} />
            {success}
          </p>
        )}

        <div className="text-center text-sm font-medium">
          <Link to="/login/seller" className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-350">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;