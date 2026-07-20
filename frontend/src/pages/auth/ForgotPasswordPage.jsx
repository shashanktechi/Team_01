import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BrandStamp } from '../../components/ui/BrandStamp';
import { BrandMark } from '../../components/ui/BrandMark';
import { Mail, KeyRound, Lock, Loader2, ArrowLeft } from 'lucide-react';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify-reset-otp', { email, otp });
      setResetToken(res.data.resetToken);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { email, resetToken, newPassword });
      navigate('/login', { state: { message: 'Password reset successful. Please log in.' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-kraft p-4 lg:p-0 overflow-hidden relative">
      {/* Top Left Logo */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-4 left-4 lg:top-8 lg:left-8 z-50 hover:opacity-80 transition-opacity focus:outline-none"
      >
        <BrandMark />
      </button>

      <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row bg-kraft rounded-2xl shadow-xl border border-ink/10 overflow-hidden h-[700px]">
        
        {/* Left Col - Illustration */}
        <div className="hidden lg:flex w-1/2 bg-surface p-12 flex-col justify-between border-r border-ink/10 relative">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l10 10M10 0l10 10M0 10l10 10M10 10l10 10M0 20l10-10M10 20l10-10' stroke='%231F2A24' stroke-width='0.5' fill='none'/%3E%3C/svg%3E\")" }}></div>
          <div>
            <h1 className="font-display font-black text-5xl text-ink leading-tight tracking-tight mt-8 relative z-10">
              Forgot <br/> Password?
            </h1>
            <p className="font-body text-ink-muted mt-4 max-w-sm relative z-10">
              Don't worry, we'll get you back to shopping in no time.
            </p>
          </div>
          <div className="relative z-10">
            <BrandStamp className="w-48 md:w-56 h-auto text-bazaar-green opacity-50" />
          </div>
        </div>

        {/* Right Col - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative bg-kraft">
          <div className="w-full max-w-sm">
            
            {error && (
              <div className="mb-6 p-4 bg-clay/10 border border-clay/20 text-clay rounded-lg text-sm font-body">
                {error}
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-6">
                <div>
                  <h2 className="font-display font-black text-3xl text-ink tracking-tight">Reset Password</h2>
                  <p className="font-body text-sm text-ink-muted mt-2">Enter your email to receive a verification code.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-mono text-xs font-bold uppercase tracking-wider text-ink">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
                      <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 border-ink/20 focus:border-bazaar-green"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Code'}
                </Button>

                <div className="text-center">
                  <Link to="/login" className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-ink-muted hover:text-ink transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                  </Link>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <h2 className="font-display font-black text-3xl text-ink tracking-tight">Enter Code</h2>
                  <p className="font-body text-sm text-ink-muted mt-2">We sent a 6-digit code to <strong className="text-ink">{email}</strong>.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-mono text-xs font-bold uppercase tracking-wider text-ink">Verification Code</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
                      <Input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="pl-10 h-12 border-ink/20 focus:border-marigold font-mono tracking-widest text-lg"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" variant="marigold" className="w-full h-12 text-lg" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify Code'}
                </Button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <h2 className="font-display font-black text-3xl text-ink tracking-tight">New Password</h2>
                  <p className="font-body text-sm text-ink-muted mt-2">Enter your new password.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-mono text-xs font-bold uppercase tracking-wider text-ink">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
                      <Input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 h-12 border-ink/20 focus:border-bazaar-green"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Update Password'}
                </Button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
