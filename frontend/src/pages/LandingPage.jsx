import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/Button';
import { BrandMark } from '../components/ui/BrandMark';
import { useCity } from '../context/CityContext';
import { useAuth } from '../context/AuthContext';
import { useEnvironment } from '../context/EnvironmentContext';
import { Icon3D } from '../components/ui/Icon3D';
import { HeroSphere3D } from '../components/ui/HeroSphere3D';

const FEATURES = [
  {
    icon: 'pin',
    title: 'Hyperlocal Delivery',
    description: 'Fast delivery from stores right in your neighbourhood. We serve any town, not just metros.',
    color: '#16A34A',
  },
  {
    icon: 'delivery',
    title: 'Real-time Tracking',
    description: 'Watch your order travel from the store to your door with live status updates.',
    color: '#22C55E',
  },
  {
    icon: 'check',
    title: 'Verified Stores',
    description: 'Every store is verified by our team before they can sell, guaranteeing quality and freshness.',
    color: '#16A34A',
  },
  {
    icon: 'cart',
    title: 'For Everyone',
    description: 'Customers get groceries fast. Store owners reach more buyers. Delivery partners earn flexibly.',
    color: '#22C55E',
  },
];

const CATEGORY_CHIPS = [
  { icon: 'fruits', label: 'Fruits' },
  { icon: 'dairy', label: 'Dairy' },
  { icon: 'bakery', label: 'Bakery' },
  { icon: 'snacks', label: 'Snacks' },
  { icon: 'beverages', label: 'Drinks' },
  { icon: 'household', label: 'Household' },
];

// Parallax panel card
function FeatureCard({ icon, title, description, color, style }) {
  const ref = useRef(null);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const prefersReduced = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  const onMove = (e) => {
    if (prefersReduced.current || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTx((x / rect.width) * 6);
    setTy((y / rect.height) * 6);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => { setTx(0); setTy(0); }}
      className="fm-panel rounded-2xl p-6 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300 cursor-default"
      style={{
        transform: `translate(${tx}px, ${ty}px)`,
        transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
        ...style,
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: `${color}18` }}
      >
        <Icon3D name={icon} size={32} />
      </div>
      <div>
        <h3
          className="font-display font-bold text-lg mb-1.5"
          style={{ color: '#000000' }}
        >
          {title}
        </h3>
        <p className="font-body text-sm text-black leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const { setIsCityModalOpen, selectedCity } = useCity();
  const { user, loading } = useAuth();
  const { setMode } = useEnvironment();
  const heroRef = useRef(null);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    setMode('hero');
  }, [setMode]);

  // Auth redirect
  useEffect(() => {
    if (!loading && user) {
      if (
        (user.role === 'STORE_ADMIN' || user.role === 'DELIVERY_PARTNER') &&
        user.verificationStatus !== 'APPROVED'
      ) {
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

  // Scroll progress for hero fade-out effect
  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return;
      const h = heroRef.current.offsetHeight;
      setScrollPct(Math.min(1, window.scrollY / h));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleGuest = () => {
    if (!selectedCity) setIsCityModalOpen(true);
    navigate('/stores');
  };

  // Hero content fades out as you scroll
  const heroOpacity = Math.max(0, 1 - scrollPct * 2.2);
  const heroY = scrollPct * 60;

  return (
    <div
      className="min-h-screen font-body antialiased flex flex-col w-full"
      style={{ background: 'transparent' }}
    >
      <div className="fixed inset-0 pointer-events-none -z-10">
        <HeroSphere3D />
      </div>

      {/* ── Top Navigation ── */}
      <nav
        className="sticky top-0 w-full z-50 transition-all duration-300"
        style={{
          background: scrollPct > 0.05
            ? 'rgba(255, 255, 255,0.88)'
            : 'transparent',
          backdropFilter: scrollPct > 0.05 ? 'blur(16px)' : 'none',
          borderBottom: scrollPct > 0.05
            ? '1px solid rgba(18,19,26,0.08)'
            : '1px solid transparent',
        }}
      >
        <div className="w-full mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="hover:opacity-80 transition-opacity focus:outline-none"
          >
            <BrandMark />
          </button>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGuest}
              className="hidden sm:flex text-ink"
            >
              Browse
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/register')}
              className="hidden sm:flex"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden"
        style={{ paddingTop: '80px' }}
      >
        {/* Text content — fades as you scroll (3D scene visible behind) */}
        <div
          style={{
            opacity: heroOpacity,
            transform: `translateY(${heroY}px)`,
            transition: 'opacity 0.1s linear, transform 0.1s linear',
          }}
          className="relative z-10 flex flex-col items-center max-w-4xl"
        >
          {/* Pre-headline badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full fm-panel text-sm font-mono font-bold uppercase tracking-widest"
            style={{ color: '#16A34A' }}>
            <Icon3D name="star" size={18} />
            <span>Freshness In Motion</span>
          </div>

          {/* Main headline */}
          <h1
            className="font-display font-black leading-none tracking-tight mb-6"
            style={{
              fontSize: 'clamp(3rem, 9vw, 8rem)',
              color: '#000000',
              letterSpacing: '-0.03em',
            }}
          >
            Fresh From{' '}
            <span style={{ color: '#16A34A' }}>The</span>{' '}
            Mandi.
          </h1>

          <p
            className="font-body text-xl max-w-xl mb-10 leading-relaxed"
            style={{ color: '#000000' }}
          >
            Quick Cart delivers farm-fresh produce and your favourite snacks
            directly to your door in under{' '}
            <span style={{ color: '#16A34A', fontWeight: 600 }}>10 minutes</span>.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button
              onClick={() => navigate('/register')}
              size="lg"
              variant="primary"
              className="w-full sm:w-auto min-w-[180px]"
            >
              Get Started — Free
            </Button>
            <Button
              variant="outline"
              onClick={handleGuest}
              size="lg"
              className="w-full sm:w-auto min-w-[160px] !text-black !border-black"
            >
              Browse as Guest
            </Button>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-12">
            {CATEGORY_CHIPS.map((c) => (
              <button
                key={c.label}
                onClick={handleGuest}
                className="flex items-center gap-2 px-4 py-2 rounded-full fm-panel text-xs font-mono font-bold uppercase tracking-wider text-ink hover:-translate-y-0.5 transition-transform duration-200"
                style={{ color: '#000000' }}
              >
                <Icon3D name={c.icon} size={22} />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ opacity: heroOpacity }}
        >
          <span className="font-mono text-xs uppercase tracking-widest"
            style={{ color: '#000000' }}>
            Scroll to explore
          </span>
          <div
            className="w-5 h-8 rounded-full border-2 flex items-start justify-center p-1"
            style={{ borderColor: 'rgba(18,19,26,0.2)' }}
          >
            <div
              className="w-1 h-2 rounded-full"
              style={{
                background: '#16A34A',
                animation: 'scrollDot 1.8s ease-in-out infinite',
              }}
            />
          </div>
          <style>{`
            @keyframes scrollDot {
              0%, 100% { transform: translateY(0); opacity: 1; }
              60% { transform: translateY(8px); opacity: 0.3; }
            }
          `}</style>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section
        className="py-24 md:py-32 px-6 lg:px-12 w-full mx-auto relative z-10"
        style={{ background: 'transparent' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-mono text-xs uppercase tracking-widest mb-4 block"
              style={{ color: '#16A34A' }}>
              Why Quick Cart
            </span>
            <h2
              className="font-display font-black leading-tight"
              style={{
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                color: '#000000',
                letterSpacing: '-0.02em',
              }}
            >
              Built for your town,<br />
              <span style={{ color: '#16A34A' }}>not just the metro.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Band ── */}
      <section
        className="py-16 w-full relative z-10"
        style={{
          background: '#12131A',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 lg:px-12 grid grid-cols-3 gap-8">
          {[
            { num: '< 10', label: 'Minutes delivery', suffix: 'min' },
            { num: '100+', label: 'Local stores', suffix: '' },
            { num: '4.9★', label: 'Customer rating', suffix: '' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div
                className="font-display font-black mb-1"
                style={{
                  fontSize: 'clamp(1.8rem, 4vw, 3.5rem)',
                  color: '#16A34A',
                  letterSpacing: '-0.02em',
                }}
              >
                {s.num}
              </div>
              <div className="font-body text-sm" style={{ color: 'rgba(255, 255, 255,0.55)' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        className="py-24 md:py-32 w-full relative z-10"
        style={{ background: 'transparent' }}
      >
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2
            className="font-display font-black mb-6 leading-tight"
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              color: '#000000',
              letterSpacing: '-0.02em',
            }}
          >
            Ready to get groceries{' '}
            <span style={{ color: '#16A34A' }}>delivered?</span>
          </h2>
          <p className="font-body text-lg mb-10" style={{ color: '#000000' }}>
            Join Quick Cart today and experience the fastest, freshest delivery in your town.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate('/register')}
              size="lg"
              variant="primary"
              className="w-full sm:w-auto px-10"
            >
              Get Started — Free
            </Button>
            <Button
              variant="outline"
              onClick={handleGuest}
              size="lg"
              className="w-full sm:w-auto px-10"
            >
              Browse as Guest
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
