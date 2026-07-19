import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { authService } from '../../services/authService';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { BrandStamp } from '../../components/ui/BrandStamp';

export function RegisterPage() {
  const [formData, setFormData] = useState({ 
    name: '', email: '', phone: '', password: '', role: 'CUSTOMER',
    storeName: '', city: '', storeAddress: '', otp: ''
  });
  const [step, setStep] = useState(1); // 1: details, 2: otp
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/otp/send', { email: formData.email, phone: formData.phone });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Backend expects storeLat and storeLng for STORE_ADMIN, even if we removed them from UI. 
      // We will provide mock coords 0.0, 0.0 so the geocode placeholder passes.
      const payload = { ...formData };
      if (payload.role === 'STORE_ADMIN') {
        payload.storeLat = 0.0;
        payload.storeLng = 0.0;
      }
      
      await authService.register(payload);
      
      // If store/delivery, we should log them in directly because the token is returned, 
      // but they will hit the pending page due to our ProtectedRoute setup!
      // However, authService.register sets localStorage token automatically.
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Column: Crate Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface border-r border-ink/10 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l10 10M10 0l10 10M0 10l10 10M10 10l10 10M0 20l10-10M10 20l10-10' stroke='%231F2A24' stroke-width='0.5' fill='none'/%3E%3C/svg%3E\")" }}></div>
        
        {/* Simple SVG Crate Illustration */}
        <svg viewBox="0 0 400 400" className="w-full max-w-md animate-[pulse_4s_ease-in-out_infinite]" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Crate 1 (Bottom) */}
          <rect x="50" y="250" width="300" height="100" rx="4" fill="#E8A33D" fillOpacity="0.2" stroke="#1F2A24" strokeWidth="4"/>
          <line x1="50" y1="280" x2="350" y2="280" stroke="#1F2A24" strokeWidth="4"/>
          <line x1="50" y1="310" x2="350" y2="310" stroke="#1F2A24" strokeWidth="4"/>
          {/* Apples in Crate 1 */}
          <circle cx="100" cy="240" r="25" fill="#C1502E" stroke="#1F2A24" strokeWidth="4"/>
          <circle cx="150" cy="235" r="25" fill="#C1502E" stroke="#1F2A24" strokeWidth="4"/>
          <circle cx="200" cy="245" r="25" fill="#C1502E" stroke="#1F2A24" strokeWidth="4"/>
          <circle cx="250" cy="230" r="25" fill="#C1502E" stroke="#1F2A24" strokeWidth="4"/>
          <circle cx="300" cy="240" r="25" fill="#C1502E" stroke="#1F2A24" strokeWidth="4"/>
          
          {/* Crate 2 (Top, angled) */}
          <g transform="translate(60, 90) rotate(-5)">
            <rect x="0" y="50" width="260" height="90" rx="4" fill="#F3EDE1" stroke="#1F2A24" strokeWidth="4"/>
            <line x1="0" y1="80" x2="260" y2="80" stroke="#1F2A24" strokeWidth="4"/>
            <line x1="0" y1="110" x2="260" y2="110" stroke="#1F2A24" strokeWidth="4"/>
            {/* Greens/Tomatoes in Crate 2 */}
            <circle cx="50" cy="40" r="20" fill="#0F5132" stroke="#1F2A24" strokeWidth="4"/>
            <circle cx="90" cy="35" r="20" fill="#0F5132" stroke="#1F2A24" strokeWidth="4"/>
            <circle cx="130" cy="45" r="20" fill="#0F5132" stroke="#1F2A24" strokeWidth="4"/>
            <circle cx="170" cy="30" r="20" fill="#0F5132" stroke="#1F2A24" strokeWidth="4"/>
            <circle cx="210" cy="40" r="20" fill="#0F5132" stroke="#1F2A24" strokeWidth="4"/>
          </g>
        </svg>

        <h2 className="mt-8 font-display text-4xl text-ink font-black text-center">Fresh From <br/> The Market</h2>
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
          <CardHeader className="text-center px-0 flex flex-col items-center">
            <BrandStamp className="w-16 h-16 mb-4" />
            <CardDescription className="font-body text-ink-muted">Create a new account</CardDescription>
          </CardHeader>
        
        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-error bg-error-container rounded-md">
                  {error}
                </div>
              )}
              
              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium">I want to register as a:</label>
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="STORE_ADMIN">Store Owner</option>
                  <option value="DELIVERY_PARTNER">Delivery Partner</option>
                </select>
              </div>

              <Input
                label="Full Name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                placeholder="+1234567890"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />

              {formData.role === 'STORE_ADMIN' && (
                <div className="space-y-4 mt-4 pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-sm text-gray-700">Store Details</h3>
                  <Input
                    label="Store Name"
                    name="storeName"
                    placeholder="My Grocery Store"
                    value={formData.storeName}
                    onChange={handleChange}
                    required
                  />
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium">City</label>
                    <select 
                      name="city" 
                      value={formData.city} 
                      onChange={handleChange}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Select a city</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Mumbai">Mumbai</option>
                    </select>
                  </div>
                  <Input
                    label="Store Address"
                    name="storeAddress"
                    placeholder="123 Main St, Area"
                    value={formData.storeAddress}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" isLoading={loading}>
                Continue
              </Button>
              <div className="text-center text-sm text-on-surface-variant">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-label-md">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
             <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-error bg-error-container rounded-md">
                  {error}
                </div>
              )}
              <div className="text-sm text-gray-600 mb-4">
                We've sent a verification code to <strong>{formData.email}</strong>.
              </div>
              <Input
                label="Enter OTP"
                name="otp"
                type="text"
                placeholder="123456"
                value={formData.otp}
                onChange={handleChange}
                required
              />
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" isLoading={loading}>
                Complete Registration
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)}>
                Back
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
      </div>
    </div>
  );
}
