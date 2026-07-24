import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { BrandStamp } from '../../components/ui/BrandStamp';
import { BrandMark } from '../../components/ui/BrandMark';
import { useEnvironment } from '../../context/EnvironmentContext';
import { HeroSphere3D } from '../../components/ui/HeroSphere3D';

export function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { setMode } = useEnvironment();

  React.useEffect(() => {
    setMode('hero');
  }, [setMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const isEmail = identifier.includes('@');
      const payload = isEmail ? { email: identifier, password } : { username: identifier, password };
      await login(payload);
      navigate('/');
    } catch (err) {
      let errorMessage = err.response?.data?.error || err.response?.data?.message;
      if (!errorMessage) {
        if (err.response?.status === 502 || err.message?.includes('502')) {
          errorMessage = 'Backend server is initializing. Please wait a few seconds and click Sign In again.';
        } else {
          errorMessage = err.message || 'Invalid email or password. Please try again.';
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-transparent relative">
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

      {/* Left Column: Transparent area for 3D Sphere */}
      <div className="hidden lg:flex lg:w-1/2 bg-transparent flex-col items-center justify-center p-12 relative overflow-hidden pointer-events-none">
        {/* Global Night Market scene shows through here */}
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white/20 backdrop-blur-2xl border-l border-white/30 shadow-night-lg">
        <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
          <CardHeader className="text-center px-0 flex flex-col items-center">
            <BrandStamp className="w-32 md:w-40 h-auto mb-4" />
            <CardDescription className="font-body text-black">Enter your credentials to access your account</CardDescription>
          </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-error bg-danger/10 rounded-md">
                {error}
              </div>
            )}
            <Input
              label="Email or Username"
              type="text"
              placeholder="name@example.com or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs font-mono uppercase tracking-wider text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" isLoading={loading}>
              Sign In
            </Button>
            <div className="text-center text-sm text-black">
              Don't have an account?{' '}
              <Link to="/register" className="text-xs font-mono uppercase tracking-wider text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  );
}
