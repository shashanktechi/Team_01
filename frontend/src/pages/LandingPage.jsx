import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/Button';
import { BrandStamp } from '../components/ui/BrandStamp';
import { BrandMark } from '../components/ui/BrandMark';
import { useCity } from '../context/CityContext';
import { useAuth } from '../context/AuthContext';

import { Badge } from '../components/ui/Badge';

import { TagSphere } from '../components/ui/TagSphere';

export function LandingPage() {
  const navigate = useNavigate();
  const { setIsCityModalOpen, selectedCity } = useCity();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if ((user.role === 'STORE_ADMIN' || user.role === 'DELIVERY_PARTNER') && user.verificationStatus !== 'APPROVED') {
        navigate('/pending');
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-background relative">
      {/* Absolute Header for BrandMark */}
      <div className="absolute top-0 left-0 p-6 z-10 hidden lg:block">
        <BrandMark />
      </div>

      {/* Left Column: 3D Sphere */}
      <div className="w-full lg:w-1/2 bg-surface border-b lg:border-b-0 lg:border-r border-ink/10 flex items-center justify-center relative overflow-hidden py-12 lg:py-0">
        {/* Mobile Header inline in left column */}
        <div className="absolute top-0 left-0 p-4 z-10 block lg:hidden w-full flex justify-center bg-surface/80 backdrop-blur-sm border-b border-ink/10">
          <BrandMark />
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l10 10M10 0l10 10M0 10l10 10M10 10l10 10M0 20l10-10M10 20l10-10' stroke='%231F2A24' stroke-width='0.5' fill='none'/%3E%3C/svg%3E\")" }}></div>
        <TagSphere />
      </div>

      {/* Right Column: Hero Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="max-w-md text-center lg:text-left flex flex-col items-center lg:items-start relative">
          
          <BrandStamp className="w-24 h-24 mb-6" animateThump={false} />

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
            <Button variant="outline" onClick={handleGuest} size="lg" className="w-full sm:w-auto">
              Browse as Guest
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
