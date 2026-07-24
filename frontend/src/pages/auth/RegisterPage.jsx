import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { authService } from '../../services/authService';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BrandStamp } from '../../components/ui/BrandStamp';
import { BrandMark } from '../../components/ui/BrandMark';
import { Mail, Phone, User, Lock, Store, MapPin, Building2, Loader2, KeyRound, Locate } from 'lucide-react';
import { getUserLocation } from '../../utils/geo';
import { HeroSphere3D } from '../../components/ui/HeroSphere3D';
import { MapPicker } from '../../components/ui/MapPicker';

export function RegisterPage() {
  const [formData, setFormData] = useState({ 
    name: '', username: '', email: '', phone: '', password: '', role: 'CUSTOMER',
    storeName: '', city: '', storeAddress: '', storeType: 'STORE', otp: '', vehicleType: 'Bike', vehicleNumber: '', vehicleName: '', vehicleModel: '', storeLat: '', storeLng: ''
  });
  const [step, setStep] = useState(1); // 1: details, 2: otp
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const extractError = (err) => {
    if (err.response?.data) {
      if (err.response.data.errors) {
        return Object.values(err.response.data.errors).join(', ');
      }
      if (err.response.data.message) {
        return err.response.data.message;
      }
      if (err.response.data.error) {
        return err.response.data.error;
      }
    }
    return err.message || 'An unexpected error occurred.';
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/otp/send', { email: formData.email, phone: formData.phone });
      setStep(2);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { ...formData };
      if (payload.role === 'STORE_ADMIN') {
        if (!payload.storeLat || !payload.storeLng) {
          setError('Please detect your location for the store.');
          setLoading(false);
          return;
        }
      }
      
      await authService.register(payload);
      navigate('/');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4 lg:p-0 overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <HeroSphere3D />
      </div>
      {/* Top Left Logo */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-4 left-4 lg:top-8 lg:left-8 z-50 hover:opacity-80 transition-opacity focus:outline-none"
      >
        <BrandMark />
      </button>

      <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row bg-white/20 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(18,19,26,0.1)] border border-white/30 overflow-hidden min-h-[700px]">
        
        {/* Left Col - Illustration */}
        <div className="hidden lg:flex w-1/2 bg-transparent p-12 flex-col justify-between border-r border-white/20 relative">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l10 10M10 0l10 10M0 10l10 10M10 10l10 10M0 20l10-10M10 20l10-10' stroke='%231F2A24' stroke-width='0.5' fill='none'/%3E%3C/svg%3E\")" }}></div>
          <div>
            <h1 className="font-display font-black text-5xl text-black leading-tight tracking-tight mt-8 relative z-10">
              Fresh From <br/> The Market
            </h1>
            <p className="font-body text-black mt-4 max-w-sm relative z-10">
              Join QuickCart to get the freshest produce delivered directly from the farm to your door.
            </p>
          </div>
          <div className="relative z-10">
            <BrandStamp className="w-48 md:w-56 h-auto text-primary opacity-50" />
          </div>
        </div>

        {/* Right Col - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative bg-transparent overflow-y-auto">
          <div className="w-full max-w-sm">
            
            {error && (
              <div className="mb-6 p-4 bg-danger/10 border border-clay/20 text-danger rounded-lg text-sm font-body">
                {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="text-center lg:text-left mb-6">
                  <h2 className="font-display font-black text-3xl text-ink tracking-tight">Create Account</h2>
                  <p className="font-body text-sm text-black mt-2">Join our growing community.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-mono text-xs font-bold uppercase tracking-wider text-ink">I want to register as a</label>
                    <div className="relative">
                      <select 
                        name="role" 
                        value={formData.role} 
                        onChange={handleChange}
                        className="w-full h-12 bg-transparent border border-border rounded-lg px-4 font-body focus:border-bazaar-green focus:ring-1 focus:ring-bazaar-green outline-none transition-colors appearance-none"
                      >
                        <option value="CUSTOMER">Customer</option>
                        <option value="STORE_ADMIN">Store Owner</option>
                        <option value="DELIVERY_PARTNER">Delivery Partner</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-ink/40">
                        ▼
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
                    <Input
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="pl-10 h-12 border-border focus:border-bazaar-green"
                    />
                  </div>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
                    <Input
                      name="username"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      minLength={3}
                      className="pl-10 h-12 border-border focus:border-bazaar-green"
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="pl-10 h-12 border-border focus:border-bazaar-green"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
                    <Input
                      name="phone"
                      type="tel"
                      placeholder="Phone (+1234567890)"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="pl-10 h-12 border-border focus:border-bazaar-green"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
                    <Input
                      name="password"
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      className="pl-10 h-12 border-border focus:border-bazaar-green"
                    />
                  </div>

                  {(formData.role === 'STORE_ADMIN' || formData.role === 'DELIVERY_PARTNER') && (
                    <div className="pt-4 border-t border-dashed border-border space-y-4">
                      <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-muted">Additional Details</h3>
                      
                      {formData.role === 'STORE_ADMIN' && (
                        <>
                          <div className="relative">
                            <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
                            <Input
                              name="storeName"
                              placeholder="Store Name"
                              value={formData.storeName}
                              onChange={handleChange}
                              required
                              className="pl-10 h-12 border-border focus:border-bazaar-green"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">Store Category / Type</label>
                            <div className="relative">
                              <select 
                                name="storeType" 
                                value={formData.storeType} 
                                onChange={handleChange}
                                required
                                className="w-full h-12 bg-transparent border border-border rounded-lg px-4 font-body focus:border-bazaar-green focus:ring-1 focus:ring-bazaar-green outline-none transition-colors appearance-none"
                              >
                                <option value="MANDI">Mandi (Bulk Produce / Market)</option>
                                <option value="STORE">Store (Regular Retail)</option>
                                <option value="WHOLESALE">Wholesale Market</option>
                                <option value="SMALL_STORE">Small Town Store</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-ink/40">
                                ▼
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40 z-10" />
                        <Input
                          name="city"
                          placeholder="Mandal / Village / Town (Enter your city)"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          className="pl-10 h-12 border-border focus:border-bazaar-green"
                        />
                      </div>

                      {formData.role === 'DELIVERY_PARTNER' && (
                        <>
                          <div className="relative">
                            <Input
                              name="vehicleName"
                              placeholder="Bike Name (e.g. Honda, Bajaj)"
                              value={formData.vehicleName}
                              onChange={handleChange}
                              required
                              className="pl-4 h-12 border-border focus:border-bazaar-green"
                            />
                          </div>

                          <div className="relative">
                            <Input
                              name="vehicleModel"
                              placeholder="Bike Model (e.g. Splendor, Activa)"
                              value={formData.vehicleModel}
                              onChange={handleChange}
                              required
                              className="pl-4 h-12 border-border focus:border-bazaar-green"
                            />
                          </div>
                          
                          <div className="relative">
                            <Input
                              name="vehicleNumber"
                              placeholder="Vehicle Number (e.g. AP 16 XX 1234)"
                              value={formData.vehicleNumber}
                              onChange={handleChange}
                              required
                              className="pl-4 h-12 border-border focus:border-bazaar-green"
                            />
                          </div>
                        </>
                      )}

                      {formData.role === 'STORE_ADMIN' && (
                        <>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
                            <Input
                              name="storeAddress"
                              placeholder="Full Store Address"
                              value={formData.storeAddress}
                              onChange={handleChange}
                              required
                              className="pl-10 h-12 border-border focus:border-bazaar-green"
                            />
                          </div>
                          <div className="relative z-10 w-full rounded-lg overflow-hidden border border-border">
                            <MapPicker 
                              onLocationSelect={(lat, lng) => {
                                setFormData(prev => ({ ...prev, storeLat: lat, storeLng: lng }));
                              }}
                            />
                          </div>
                          {formData.storeLat && (
                            <div className="text-xs text-bazaar-green font-mono uppercase tracking-wider flex items-center justify-center">
                              ✓ Location Pinned Successfully
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Continue'}
                </Button>

                <div className="text-center">
                  <span className="text-sm font-body text-ink-muted">Already have an account? </span>
                  <Link to="/login" className="font-mono text-xs font-bold uppercase tracking-wider text-ink hover:text-primary transition-colors">
                    Sign In
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="text-center lg:text-left mb-6">
                  <h2 className="font-display font-black text-3xl text-ink tracking-tight">Enter Code</h2>
                  <p className="font-body text-sm text-ink-muted mt-2">We sent a verification code to <strong className="text-ink">{formData.email}</strong>.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-mono text-xs font-bold uppercase tracking-wider text-ink">Verification Code</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
                      <Input
                        type="text"
                        name="otp"
                        required
                        value={formData.otp}
                        onChange={handleChange}
                        className="pl-10 h-12 border-border focus:border-marigold font-mono tracking-widest text-lg"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button type="submit" variant="marigold" className="w-full h-12 text-lg" disabled={loading}>
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Complete Registration'}
                  </Button>
                  <Button type="button" variant="outline" className="w-full h-12 text-lg" onClick={() => setStep(1)} disabled={loading}>
                    Back
                  </Button>
                  <Button type="button" variant="ghost" className="w-full h-12 text-sm text-ink-muted hover:text-ink transition-colors" onClick={handleSendOtp} disabled={loading}>
                    Didn't receive code? Resend
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
