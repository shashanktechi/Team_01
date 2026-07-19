import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ShoppingCart, Truck, BadgeCheck, Plus, Minus } from 'lucide-react';

export function StorePage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Vegetables');

  // Mock data for now
  const products = [
    {
      id: 1,
      name: 'Farm Fresh Tomato - Local (Desi)',
      size: '500g',
      price: '₹35',
      originalPrice: '₹45',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAO-Mmpbleiv3K5KVIp3xBt88bLDo_1o-8z2TtKOipndA0YbweY_5-EUa7OYJ5Z5qLubU8-Ct1oNN1z3Nkb85qSzY1_0pmdemYe-BN6JuvQ827gqE82eM1tL2RE28yZ4MJiPfjP_qT-UKjV-oPoMwkB5n2XYGIytIvJcBkB0JBvsLsWmedZoKBlXuqnU25X1iogfB9eGHqC7KJIepODPM_zoM97ay38h52IMo8bz6NDvpeN4f0np37',
      badge: { text: 'Fresh', icon: 'leaf', color: 'primary' },
      quantity: 1
    },
    {
      id: 2,
      name: 'Fresh Palak (Spinach)',
      size: '250g',
      price: '₹18',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVOSIfq0FXs_lahRWFP_2EKZhWVqslum8khdNwtQKJBUc-ksZUMg4uBN5xcd5dJhywRlSVbMj1nnRFzOQvO5D0C1s-hQb4Qu4jjXjSjL3g48KYBpekoYDlaFRR0qP5jQmKHTB1TLPE2YNuU7TU-LUaOIpUpc47dmfl0DtdXCqzBHSYiVtDGWZkITLsRd420u8G4tXO2ujzB-9wqkDYpRtedpxREJ5jdZQemKJOQuKpeRiichKpXB42',
      quantity: 0
    },
    {
      id: 3,
      name: 'Brinjal Bharta',
      size: '500g',
      price: '₹40',
      originalPrice: '₹50',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhGMoYsc2n-lvz1s9IReqzQA6tOik8EM3w1JAcItSPs5GmlptkRr7QvOKWKnVoTYd1YP-beEkZSSBWXDJqWvvlJZaaafc_2dg_Nd3pBepYs1YQPTTkak9V8d1_haqihPmW_Y-vjuFmchXVMjiFbNRiiqNND3pg9H6S6qMmMsgWNlqpm4iHm-MiCOyiBPtmLmA9ke6x3vN092N0eOBUEXMSLWY-QSia9U_wE8y1d-IIdmRiwOxQU2Kj',
      badge: { text: '20% OFF', color: 'secondary' },
      quantity: 0
    },
    {
      id: 4,
      name: 'Carrot - Orange',
      size: '500g',
      price: '₹45',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCosHlrG9XKmk_JX5HQ19zY0JMeEb0KHA25IOUeXIfgz050j2lSZ5lQgticsDhS-I86h-5WrAkBc6HO6mv524Ul0uFEoioajm3-aYNDvJDuOHHAjGEyXZxt5M7vbJoCbyOqmzyzsyauvbj8LLrMnK23YvzJ0UW_1t63JdqrEtJ2ZFkNl-hXwBNmp79BEC3lDFfJ54rmQyGACYkp7lblX56oudsOAWkfR_ciLv9ufkj7jbItaVB9EDxJ',
      quantity: 0
    }
  ];

  return (
    <div className="bg-background text-on-background min-h-screen pb-24 font-body-lg">
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-md">
        <div className="flex flex-col gap-2 px-4 py-3 w-full max-w-7xl mx-auto">
          <div className="flex justify-between items-center w-full">
            <button onClick={() => navigate(-1)} className="text-on-surface-variant hover:bg-surface-container-high transition-colors p-2 rounded-full active:scale-95 duration-200">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="font-display-lg-mobile text-display-lg-mobile text-primary tracking-tight">Quick_Cart</div>
            <button className="text-on-surface-variant hover:bg-surface-container-high transition-colors p-2 rounded-full active:scale-95 duration-200 relative">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute top-0 right-0 bg-error text-on-error rounded-full w-4 h-4 flex items-center justify-center font-label-md text-label-md">1</span>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-[72px] max-w-7xl mx-auto md:px-margin-desktop">
        <div className="relative w-full h-48 md:h-64 md:rounded-xl overflow-hidden shadow-sm mt-4 md:mt-0">
          <div className="bg-cover bg-center w-full h-full absolute inset-0" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCY2yQMEoQ7xOZp8iY5U4c-V55skLTdmxhHCaVXne2pD1PbvgKj5Ti8tocizYlJwEuzhSxG24ygRmpXTPQHkAhHgVWtv8F1g-K4VSRyoMKVkqC5-qwTrjhwmB6OGwdMKGjDKSL0FTj6GUOh8ips1mSdrJxZZFUeHb-IZfvZp67Vhy-ETCIXpjQW7pb1sNb6AauzVLAsJcLCjIAlmxSmc3uez1bHiAuh6drRpkOnb685E7leHjIzVKgg')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-surface rounded-lg shadow-md flex items-center justify-center border-2 border-primary overflow-hidden">
                <img className="w-10 h-10 object-contain" alt="Store logo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkSICIB-KSUnM7o6W_iEby3Zi1AdJLe2TFvrvrZvb2W90KvDg7zJZLa3KBDCkyVedIQVvxCQac60YPhxm833ZTRyZX93OVEnRcUHL3gCNLkufEMWdtbFJb65KMY8ysLPrducL6wAESa9_zBdREMa-OGxRb_5DPep69nP9JedVAxH-PWyh24utTiSJg2QQMjH6T-Jmk0_fz7k875z9miTCzcXfVp_Ox7VD_bVhGRZ0CzDzHlxQpaBKl" />
              </div>
              <div>
                <h1 className="font-headline-md text-headline-md text-white">FreshMart Indiranagar</h1>
                <p className="font-body-sm text-body-sm text-white/80 flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" /> Delivery in 10 mins
                </p>
              </div>
            </div>
            <div className="absolute top-4 right-4 bg-primary-container text-on-primary-container font-label-md text-label-md px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
              <BadgeCheck className="h-3.5 w-3.5" /> Freshness: 98%
            </div>
          </div>
        </div>

        <nav className="sticky top-[72px] z-40 bg-surface/90 backdrop-blur-md shadow-sm -mx-4 px-4 md:mx-0 md:px-0 py-2 border-b border-surface-variant overflow-x-auto hide-scrollbar">
          <ul className="flex gap-4 min-w-max pb-1">
            {['Vegetables', 'Fruits', 'Staples', 'Dairy', 'Snacks'].map(cat => (
              <li key={cat}>
                <button 
                  onClick={() => setActiveCategory(cat)}
                  className={`font-label-md text-label-md px-4 py-2 rounded-full shadow-sm active:scale-95 transition-colors ${
                    activeCategory === cat 
                      ? 'bg-primary text-on-primary' 
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <section className="p-margin-mobile md:p-0 md:py-margin-desktop">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Fresh {activeCategory}</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-gutter">
            {products.map(p => (
              <article key={p.id} className="bg-surface-container-lowest rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-200">
                <div className="relative aspect-square bg-surface-container-low p-2">
                  {p.badge && (
                    <div className={`absolute top-2 left-2 ${p.badge.color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-secondary-container text-on-secondary-container'} font-label-md text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 z-10`}>
                      {p.badge.text}
                    </div>
                  )}
                  <img className="w-full h-full object-contain mix-blend-multiply" alt={p.name} src={p.image} />
                </div>
                <div className="p-2 flex flex-col flex-grow justify-between gap-2">
                  <div>
                    <h3 className="font-body-sm text-body-sm text-on-surface line-clamp-2">{p.name}</h3>
                    <p className="font-label-md text-label-md text-on-surface-variant mt-1">{p.size}</p>
                  </div>
                  <div className="flex flex-col gap-2 mt-auto">
                    <div className="flex items-center gap-1">
                      <span className="font-price-sm text-price-sm text-on-surface">{p.price}</span>
                      {p.originalPrice && <span className="font-body-sm text-body-sm text-on-surface-variant line-through text-[10px]">{p.originalPrice}</span>}
                    </div>
                    {p.quantity > 0 ? (
                      <div className="flex items-center justify-between border border-primary rounded-lg overflow-hidden h-8">
                        <button className="w-8 h-full bg-primary/10 text-primary flex items-center justify-center active:bg-primary/20 transition-colors">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-label-md text-label-md text-primary font-bold">{p.quantity}</span>
                        <button className="w-8 h-full bg-primary text-on-primary flex items-center justify-center active:bg-primary-container transition-colors">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button className="w-full h-8 bg-surface-container-low border border-outline-variant text-primary font-label-md text-label-md rounded-lg flex items-center justify-center hover:bg-surface-container active:scale-95 transition-all">
                        ADD
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 w-full z-50 bg-surface shadow-[0_-8px_24px_rgba(0,0,0,0.12)] rounded-t-xl overflow-hidden p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-primary text-on-primary rounded-xl p-3 shadow-lg active:scale-[0.98] transition-transform duration-200 cursor-pointer">
          <div className="flex flex-col">
            <span className="font-label-md text-label-md opacity-90">1 Item | ₹35</span>
            <span className="font-headline-sm text-headline-sm">View Cart</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-md text-label-md bg-white/20 px-2 py-1 rounded">Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
