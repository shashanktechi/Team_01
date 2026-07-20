import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { StoreCard } from '../components/ui/StoreCard';
import { ProductCard } from '../components/ui/ProductCard';
import { ConflictModal } from '../components/ui/ConflictModal';
import { api } from '../services/api';
import { useCity } from '../context/CityContext';
import { useCart } from '../context/CartContext';
import { ChevronRight, Percent, Clock } from 'lucide-react';

export function HomePage() {
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [topPicks, setTopPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { selectedCity, isInitialized, setIsCityModalOpen } = useCity();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const [conflictState, setConflictState] = useState({ isOpen: false });

  const handleConflict = (conflictStoreName, targetStoreName, onConfirm) => {
    setConflictState({
      isOpen: true,
      conflictStoreName,
      targetStoreName,
      onConfirm: () => {
        clearCart();
        onConfirm();
        setConflictState({ isOpen: false });
      },
      onCancel: () => setConflictState({ isOpen: false })
    });
  };

  useEffect(() => {
    if (!isInitialized) return;

    if (!selectedCity) {
      setIsCityModalOpen(true);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/public/stores/by-city?city=${encodeURIComponent(selectedCity)}`);
        
        const mappedStores = response.data.map(store => ({
          id: store.id,
          name: store.name,
          bannerImage: store.bannerUrl || '/placeholder-store-banner.svg',
          logoImage: store.logoUrl || '/placeholder-store-logo.svg',
          rating: store.freshnessScore || '4.5',
          categories: 'Groceries • Fresh Produce',
          status: store.isOpen ? 'Open Now' : 'Closed',
          deliveryTime: '10-15 min',
          distance: '1.2 km',
          rawStore: store
        }));
        setStores(mappedStores);
      } catch (error) {
        console.error("Failed to fetch stores", error);
      }

      // Mock Q-Commerce categories
      setCategories([
        { id: 1, name: 'Fresh Fruits', icon: '🍎', color: 'bg-error/10' },
        { id: 2, name: 'Vegetables', icon: '🥦', color: 'bg-bazaar-green/10' },
        { id: 3, name: 'Dairy & Bread', icon: '🥛', color: 'bg-blue-500/10' },
        { id: 4, name: 'Snacks', icon: '🥨', color: 'bg-marigold/20' },
        { id: 5, name: 'Beverages', icon: '🥤', color: 'bg-purple-500/10' },
        { id: 6, name: 'Meat & Eggs', icon: '🥚', color: 'bg-error/10' },
        { id: 7, name: 'Household', icon: '🧼', color: 'bg-teal-500/10' },
        { id: 8, name: 'See All', icon: '➡️', color: 'bg-surface' },
      ]);

      // Mock Product Data
      const mockProducts = [
        { id: 101, name: 'Whole Wheat Bread', size: '400g', price: 45, mrp: 50, discountPercent: 10, image: '/placeholder-product.svg', storeId: 1, storeName: 'Downtown Fresh', stock: 10 },
        { id: 102, name: 'Fresh Milk', size: '1L', price: 33, mrp: 35, discountPercent: 5, image: '/placeholder-product.svg', storeId: 1, storeName: 'Downtown Fresh', stock: 20 },
        { id: 103, name: 'Farm Eggs', size: '6 pcs', price: 40, mrp: 45, discountPercent: 11, image: '/placeholder-product.svg', storeId: 2, storeName: 'Uptown Grocers', stock: 15 },
        { id: 104, name: 'Lays Classic', size: '50g', price: 20, image: '/placeholder-product.svg', storeId: 1, storeName: 'Downtown Fresh', stock: 5 },
      ];

      setRecentProducts(mockProducts.slice(0, 2));
      setTopPicks(mockProducts.slice(2, 4));

      setLoading(false);
    };

    fetchData();
  }, [isInitialized, selectedCity, setIsCityModalOpen]);

  return (
    <>
      <ConflictModal {...conflictState} />
      
      {/* Hero Banner Carousel (Static for now) */}
      <section className="px-4 md:px-0">
        <div className="w-full h-32 sm:h-48 rounded-2xl bg-gradient-to-r from-bazaar-green to-teal-500 relative overflow-hidden shadow-sm flex items-center p-6">
          <div className="z-10 text-white w-2/3">
            <h2 className="font-display font-black text-2xl sm:text-3xl leading-tight mb-2">Flat ₹100 OFF</h2>
            <p className="font-body text-xs sm:text-sm text-white/90">On your first 3 local orders.</p>
          </div>
          <div className="absolute -right-4 -bottom-4 text-9xl opacity-20 transform rotate-12">🛒</div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="px-4 md:px-0">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${cat.color} flex items-center justify-center text-3xl sm:text-4xl shadow-sm group-hover:-translate-y-1 transition-transform border border-ink/5`}>
                {cat.icon}
              </div>
              <span className="font-body text-[10px] sm:text-xs font-medium text-ink text-center leading-tight">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Deals Strip */}
      <section className="px-4 md:px-0 hide-scrollbar overflow-x-auto">
        <div className="flex gap-4 pb-2 w-max">
          <div className="bg-marigold/10 border border-marigold/30 rounded-xl p-3 flex items-center gap-3 min-w-[240px]">
            <div className="w-10 h-10 rounded-full bg-marigold flex items-center justify-center text-ink">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-ink">Buy 1 Get 1 Free</p>
              <p className="font-body text-xs text-ink-muted">On select snacks</p>
            </div>
          </div>
          <div className="bg-error/10 border border-error/30 rounded-xl p-3 flex items-center gap-3 min-w-[240px]">
            <div className="w-10 h-10 rounded-full bg-error flex items-center justify-center text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-ink">Flash Sale</p>
              <p className="font-body text-xs text-ink-muted">Ends in 2h 45m</p>
            </div>
          </div>
        </div>
      </section>

      {/* Nearby Stores */}
      <section className="px-4 md:px-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-black text-xl text-ink tracking-tight">Nearby Stores</h2>
          <span className="font-body text-sm font-bold text-bazaar-green flex items-center cursor-pointer">
            See all <ChevronRight className="w-4 h-4 ml-1" />
          </span>
        </div>
        
        {stores.length === 0 && !loading ? (
          <div className="bg-chalk border border-ink/10 shadow-sm rounded-2xl p-8 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-kraft rounded-full flex items-center justify-center mb-4 text-4xl shadow-inner">
              🏪
            </div>
            <h3 className="font-display font-bold text-xl text-ink mb-2">No stores available</h3>
            <p className="font-body text-sm text-ink-muted mb-4 max-w-xs mx-auto">There are no stores available in {selectedCity} yet.</p>
            <button className="bg-bazaar-green text-white font-mono text-sm font-bold uppercase tracking-wider px-6 py-2.5 rounded-lg shadow-md hover:bg-bazaar-green/90 active:scale-95 transition-all">
              Notify Me
            </button>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar w-full">
            <div className="flex gap-4 w-max">
              {stores.map((store) => (
                <div key={store.id} className="w-[280px] sm:w-[320px]">
                  <StoreCard {...store} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Buy it Again */}
      {recentProducts.length > 0 && (
        <section className="px-4 md:px-0">
          <h2 className="font-display font-black text-xl text-ink tracking-tight mb-4">Buy it Again</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar w-full">
            <div className="flex gap-4 w-max">
              {recentProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  {...product} 
                  isOutOfStock={product.stock === 0}
                  onConflict={handleConflict}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Picks */}
      {topPicks.length > 0 && (
        <section className="px-4 md:px-0 mb-4">
          <h2 className="font-display font-black text-xl text-ink tracking-tight mb-4">Top Picks For You</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar w-full">
            <div className="flex gap-4 w-max">
              {topPicks.map((product) => (
                <ProductCard 
                  key={product.id} 
                  {...product} 
                  isOutOfStock={product.stock === 0}
                  onConflict={handleConflict}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
