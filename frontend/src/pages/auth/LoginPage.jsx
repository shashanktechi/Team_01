import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { BrandStamp } from '../../components/ui/BrandStamp';
import { BrandMark } from '../../components/ui/BrandMark';
import { TagSphere } from '../../components/ui/TagSphere';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background relative">
      {/* Top Left Logo */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-4 left-4 lg:top-8 lg:left-8 z-50 hover:opacity-80 transition-opacity focus:outline-none"
      >
        <BrandMark />
      </button>

      {/* Left Column: 3D Sphere */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface border-r border-ink/10 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l10 10M10 0l10 10M0 10l10 10M10 10l10 10M0 20l10-10M10 20l10-10' stroke='%231F2A24' stroke-width='0.5' fill='none'/%3E%3C/svg%3E\")" }}></div>
        <TagSphere />
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
          <CardHeader className="text-center px-0 flex flex-col items-center">
            <BrandStamp className="w-16 h-16 mb-4" />
            <CardDescription className="font-body text-ink-muted">Enter your credentials to access your account</CardDescription>
          </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-error bg-error-container rounded-md">
                {error}
              </div>
            )}
            <Input
              label="Email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              <Link to="/forgot-password" className="text-sm text-primary hover:underline font-label-md">
                Forgot Password?
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" isLoading={loading}>
              Sign In
            </Button>
            <div className="text-center text-sm text-on-surface-variant">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline font-label-md">
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
