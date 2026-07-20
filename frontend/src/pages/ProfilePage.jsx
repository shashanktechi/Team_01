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

  return (
    <div className="bg-kraft font-body text-ink antialiased min-h-screen">
      <div className="max-w-[480px] mx-auto bg-kraft h-full min-h-screen flex flex-col relative pb-24">
        {/* Header */}
        <header className="bg-primary text-on-primary px-4 py-6 rounded-b-3xl shadow-sm relative z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 text-white">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-display font-black text-2xl tracking-tight">{user?.name || 'Guest User'}</h1>
              <p className="font-mono text-sm opacity-90">{user?.email || 'user@example.com'}</p>
              <div className="mt-1 flex items-center gap-1 text-xs font-bold bg-black/20 w-fit px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 mt-6 flex flex-col gap-5">
          {/* QuickCart Coins / Loyalty */}
          <div className="bg-chalk rounded-2xl p-4 shadow-sm border border-ink/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-marigold/20 text-marigold rounded-full flex items-center justify-center">
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
          <div className="bg-gradient-to-br from-bazaar-green/20 to-bazaar-green/5 rounded-2xl p-4 shadow-sm border border-bazaar-green/20 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Gift className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-5 h-5 text-bazaar-green" />
                <h3 className="font-display font-bold text-lg text-bazaar-green">Refer & Earn ₹50</h3>
              </div>
              <p className="font-body text-sm text-ink/80 max-w-[200px]">Invite friends to QuickCart and get flat ₹50 off on your next order.</p>
              <Button variant="outline" className="mt-3 border-bazaar-green text-bazaar-green hover:bg-bazaar-green hover:text-white h-9 px-4 text-xs font-bold">
                Share Link
              </Button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="bg-chalk rounded-2xl shadow-sm border border-ink/5 overflow-hidden">
            {[
              { icon: MapPin, label: 'Saved Addresses', desc: 'Home, Office', path: '#' },
              { icon: CreditCard, label: 'Payment Methods', desc: 'Cards, UPI', path: '#' },
              { icon: Bell, label: 'Notifications', desc: 'Offers, Order Updates', path: '#' },
              { icon: HelpCircle, label: 'Help & Support', desc: 'FAQs, Contact Us', path: '#' },
            ].map((item, idx, arr) => (
              <div 
                key={idx} 
                className={`flex items-center justify-between p-4 cursor-pointer hover:bg-ink/5 transition-colors ${idx !== arr.length - 1 ? 'border-b border-ink/5' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-ink-muted">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-body font-bold text-ink block">{item.label}</span>
                    <span className="font-body text-xs text-ink-muted block mt-0.5">{item.desc}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-ink-muted" />
              </div>
            ))}
          </div>

          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="w-full mt-4 text-error border-error/20 hover:bg-error/10 h-12"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
