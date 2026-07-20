import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/Button';
import { BrandStamp } from '../components/ui/BrandStamp';
import { BrandMark } from '../components/ui/BrandMark';
import { useCity } from '../context/CityContext';
import { useAuth } from '../context/AuthContext';
import { TagSphere } from '../components/ui/TagSphere';
import { Card } from '../components/ui/Card';
import { MapPin, Navigation, CheckCircle, Users } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const { setIsCityModalOpen, selectedCity } = useCity();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if ((user.role === 'STORE_ADMIN' || user.role === 'DELIVERY_PARTNER') && user.verificationStatus !== 'APPROVED') {
        navigate('/pending');
      } else if (user.role === 'SYSTEM_ADMIN') {
        navigate('/admin-dashboard');
      } else if (user.role === 'STORE_ADMIN') {
        navigate('/store-dashboard');
      } else if (user.role === 'DELIVERY_PARTNER') {
        navigate('/delivery-dashboard');
      } else {
        navigate('/stores');
      }
    }
  }, [user, loading, navigate]);

  const handleGuest = () => {
    if (selectedCity) {
      navigate('/stores');
    } else {
      setIsCityModalOpen(true);
      navigate('/stores');
    }
  };

  return (
    <div className="min-h-screen bg-background font-body text-ink antialiased flex flex-col w-full">
      {/* Top Navigation */}
      <nav className="sticky top-0 w-full bg-background/90 backdrop-blur-md border-b border-border z-50">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="hover:opacity-80 transition-opacity focus:outline-none">
            <BrandMark />
          </button>
          <Button variant="outline" onClick={() => navigate('/login')}>
            Login
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] border-b border-border w-full">
        {/* Left Column: 3D Sphere */}
        <div className="w-full lg:w-1/2 bg-surface border-b lg:border-b-0 lg:border-r border-border flex items-center justify-center relative py-12 lg:py-0 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l10 10M10 0l10 10M0 10l10 10M10 10l10 10M0 20l10-10M10 20l10-10' stroke='%231F2A24' stroke-width='0.5' fill='none'/%3E%3C/svg%3E\")" }}></div>
          <TagSphere />
        </div>

        {/* Right Column: Hero Content */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-background">
          <div className="max-w-md text-center lg:text-left flex flex-col items-center lg:items-start relative">
            <BrandStamp className="w-48 md:w-56 h-auto mb-6" animateThump={false} />

            <h1 className="text-5xl lg:text-7xl font-display font-black text-ink tracking-tight mb-4 leading-none">
              Fresh <br className="hidden lg:block"/> From <br className="hidden lg:block"/> The Mandi.
            </h1>
            
            <p className="text-lg text-ink-muted mb-8 max-w-sm">
              Quick Cart delivers farm-fresh produce and your favorite snacks directly to your door in 10 minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <Button onClick={() => navigate('/register')} size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
              <Button variant="outline" onClick={handleGuest} size="lg" className="w-full sm:w-auto bg-transparent hover:bg-ink/5">
                Browse as Guest
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 w-full mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-black text-ink mb-4">Why Quick Cart?</h2>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto font-body">Everything you need, exactly when you need it, built for your town.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          <Card className="bg-surface border-border p-6 hover:-translate-y-1 transition-transform duration-200">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <MapPin className="text-primary w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl mb-2">Hyperlocal Delivery</h3>
            <p className="text-ink-muted text-sm font-body">Fast delivery from stores right in your neighborhood. We serve any town, not just metros.</p>
          </Card>

          <Card className="bg-surface border-border p-6 hover:-translate-y-1 transition-transform duration-200">
            <div className="w-12 h-12 bg-warning/30 rounded-full flex items-center justify-center mb-4">
              <Navigation className="text-ink w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl mb-2">Real-time Tracking</h3>
            <p className="text-ink-muted text-sm font-body">Watch your order travel from the store to your door with live status updates.</p>
          </Card>

          <Card className="bg-surface border-border p-6 hover:-translate-y-1 transition-transform duration-200">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="text-primary w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl mb-2">Verified Stores</h3>
            <p className="text-ink-muted text-sm font-body">Every store is verified by our team before they can sell, guaranteeing quality and freshness.</p>
          </Card>

          <Card className="bg-surface border-border p-6 hover:-translate-y-1 transition-transform duration-200">
            <div className="w-12 h-12 bg-warning/30 rounded-full flex items-center justify-center mb-4">
              <Users className="text-ink w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl mb-2">For Everyone</h3>
            <p className="text-ink-muted text-sm font-body">Customers get groceries fast. Store owners reach more buyers. Delivery partners earn on their schedule.</p>
          </Card>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 bg-surface border-t border-border mt-auto w-full">
        <div className="w-full mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-ink mb-6 tracking-tight">Ready to get your groceries delivered?</h2>
          <p className="text-lg md:text-xl text-ink-muted mb-10 max-w-2xl mx-auto font-body">Join Quick Cart today and experience the fastest, freshest delivery in your town.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={() => navigate('/register')} size="lg" className="w-full sm:w-auto px-8">
              Get Started
            </Button>
            <Button variant="outline" onClick={handleGuest} size="lg" className="w-full sm:w-auto px-8 bg-transparent hover:bg-ink/5">
              Browse as Guest
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
