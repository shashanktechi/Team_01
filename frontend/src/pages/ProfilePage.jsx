import React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, MapPin, CreditCard, Bell, HelpCircle, LogOut, ChevronRight, Gift, Star, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: MapPin, label: 'Saved Addresses', desc: 'Home, Office', action: () => alert('Saved Addresses — coming soon!') },
    { icon: CreditCard, label: 'Payment Methods', desc: 'Cards, UPI', action: () => alert('Payment Methods — coming soon!') },
    { icon: Bell, label: 'Notifications', desc: 'Offers, Order Updates', action: () => alert('Notifications — coming soon!') },
    { icon: HelpCircle, label: 'Help & Support', desc: 'FAQs, Contact Us', action: () => alert('Help & Support — coming soon!') },
  ];

  return (
    <div className="bg-background font-body text-ink antialiased min-h-screen w-full">
      <div className="w-full max-w-2xl mx-auto bg-background h-full min-h-screen flex flex-col relative pb-24">
        {/* Header */}
        <header className="bg-primary text-white px-4 py-8 rounded-b-3xl shadow-sm relative z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 text-white">
              {user?.profilePhotoUrl ? (
                <img src={user.profilePhotoUrl} alt="profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-10 h-10" />
              )}
            </div>
            <div>
              <h1 className="font-display font-black text-2xl tracking-tight">{user?.fullName || 'Guest User'}</h1>
              <p className="font-mono text-sm opacity-90">{user?.email || 'user@example.com'}</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs font-bold bg-black/20 w-fit px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </div>
                {user && (
                  <button 
                    onClick={() => navigate('/profile/settings')}
                    className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full hover:bg-white/30 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 mt-6 flex flex-col gap-5">
          {/* QuickCart Coins / Loyalty */}
          <div className="bg-surface rounded-2xl p-4 shadow-sm border border-ink/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-warning/20 text-warning rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-ink">QuickCart Coins</h3>
                <p className="font-body text-sm text-ink-muted">Use coins to get discounts</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-display font-black text-2xl text-ink">240</span>
            </div>
          </div>

          {/* Refer & Earn */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-2xl p-4 shadow-sm border border-emerald-500/20 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Gift className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold text-lg text-primary">Refer & Earn ₹50</h3>
              </div>
              <p className="font-body text-sm text-ink/80 max-w-[280px]">Invite friends to QuickCart and get flat ₹50 off on your next order.</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: 'QuickCart', text: 'Join QuickCart for fast local delivery!', url: window.location.origin });
                  } else {
                    navigator.clipboard.writeText(window.location.origin);
                    alert('Link copied to clipboard!');
                  }
                }}
                className="mt-3 border-emerald-500 text-primary hover:bg-primary hover:text-white h-9 px-4 text-xs font-bold"
              >
                Share Link
              </Button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="bg-surface rounded-2xl shadow-sm border border-ink/5 overflow-hidden">
            {menuItems.map((item, idx, arr) => (
              <button
                key={idx}
                onClick={item.action}
                className={`w-full flex items-center justify-between p-4 cursor-pointer hover:bg-ink/5 transition-colors text-left ${idx !== arr.length - 1 ? 'border-b border-ink/5' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-ink-muted">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-body font-bold text-ink block">{item.label}</span>
                    <span className="font-body text-xs text-ink-muted block mt-0.5">{item.desc}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-ink-muted" />
              </button>
            ))}
          </div>

          {/* Orders shortcut */}
          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-surface rounded-2xl p-4 shadow-sm border border-ink/5 flex items-center justify-between hover:bg-ink/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-body font-bold text-ink block">My Orders</span>
                <span className="font-body text-xs text-ink-muted block mt-0.5">Track and manage orders</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-ink-muted" />
          </button>

          {user ? (
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full mt-4 text-red-500 border-red-200 hover:bg-red-50 h-12"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          ) : (
            <Button 
              onClick={() => navigate('/login')}
              className="w-full mt-4 h-12"
            >
              Login / Register
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
