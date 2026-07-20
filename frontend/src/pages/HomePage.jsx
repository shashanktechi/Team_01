import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { StoreCard } from '../components/ui/StoreCard';
import { ProductCard } from '../components/ui/ProductCard';
import { ConflictModal } from '../components/ui/ConflictModal';
import { api } from '../services/api';
import { useCity } from '../context/CityContext';
import { useCart } from '../context/CartContext';
import { ChevronRight, Percent, Clock, Search, Mic } from 'lucide-react';

export function HomePage() {
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [topPicks, setTopPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
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

      setCategories([
        { id: 1, name: 'Fresh Fruits', icon: '🍎', color: 'bg-error/10' },
        { id: 2, name: 'Vegetables', icon: '🥦', color: 'bg-primary/10' },
        { id: 3, name: 'Dairy & Bread', icon: '🥛', color: 'bg-info/10' },
        { id: 4, name: 'Snacks', icon: '🥨', color: 'bg-warning/20' },
        { id: 5, name: 'Beverages', icon: '🥤', color: 'bg-purple-500/10' },
        { id: 6, name: 'Meat & Eggs', icon: '🥚', color: 'bg-error/10' },
        { id: 7, name: 'Household', icon: '🧼', color: 'bg-teal-500/10' },
        { id: 8, name: 'See All', icon: '➡️', color: 'bg-surface' },
      ]);

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

  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) return stores;
    const q = searchQuery.toLowerCase();
    return stores.filter(s => s.name.toLowerCase().includes(q) || s.categories.toLowerCase().includes(q));
  }, [stores, searchQuery]);

  return (
    <div className="flex flex-col gap-6 pt-4 pb-12">
      <ConflictModal {...conflictState} />
      
      {/* Search Bar */}
      <section className="px-4 md:px-0">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 h-5 w-5" />
          <input 
            className="w-full h-12 bg-surface border border-border rounded-xl pl-10 pr-10 font-body focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none text-ink shadow-sm" 
            placeholder='Search for stores or items' 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Mic className="absolute right-3 top-1/2 -translate-y-1/2 text-primary h-5 w-5 cursor-pointer" />
        </div>
      </section>

      {/* Hero Banner Carousel (Static for now) */}
      <section className="px-4 md:px-0">
        <div className="w-full h-32 sm:h-48 rounded-2xl bg-gradient-to-r from-primary to-teal-400 relative overflow-hidden shadow-sm flex items-center p-6">
          <div className="z-10 text-white w-2/3">
            <h2 className="font-bold text-2xl sm:text-3xl leading-tight mb-2">Flat ₹100 OFF</h2>
            <p className="text-xs sm:text-sm text-white/90">On your first 3 local orders.</p>
          </div>
          <div className="absolute -right-4 -bottom-4 text-9xl opacity-20 transform rotate-12">🛒</div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="px-4 md:px-0">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className="flex flex-col items-center gap-2 cursor-pointer group"
              onClick={() => setSearchQuery(cat.name === 'See All' ? '' : cat.name)}
            >
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${cat.color} flex items-center justify-center text-3xl sm:text-4xl shadow-sm group-hover:-translate-y-1 transition-transform border border-border`}>
                {cat.icon}
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-ink text-center leading-tight">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Deals Strip */}
      <section className="px-4 md:px-0 hide-scrollbar overflow-x-auto">
        <div className="flex gap-4 pb-2 w-max">
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 flex items-center gap-3 min-w-[240px]">
            <div className="w-10 h-10 rounded-full bg-warning flex items-center justify-center text-ink">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-ink">Buy 1 Get 1 Free</p>
              <p className="text-xs text-ink-muted">On select snacks</p>
            </div>
          </div>
          <div className="bg-error/10 border border-error/30 rounded-xl p-3 flex items-center gap-3 min-w-[240px]">
            <div className="w-10 h-10 rounded-full bg-error flex items-center justify-center text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-ink">Flash Sale</p>
              <p className="text-xs text-ink-muted">Ends in 2h 45m</p>
            </div>
          </div>
        </div>
      </section>

      {/* Nearby Stores */}
      <section className="px-4 md:px-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl text-ink tracking-tight">
            {searchQuery ? 'Search Results' : 'Nearby Stores'}
          </h2>
          {!searchQuery && (
            <span className="text-sm font-bold text-primary flex items-center cursor-pointer">
              See all <ChevronRight className="w-4 h-4 ml-1" />
            </span>
          )}
        </div>
        
        {filteredStores.length === 0 && !loading ? (
          <div className="bg-surface border border-border shadow-sm rounded-2xl p-8 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 text-4xl shadow-inner">
              🏪
            </div>
            <h3 className="font-bold text-xl text-ink mb-2">No stores available</h3>
            <p className="text-sm text-ink-muted mb-4 max-w-xs mx-auto">Try adjusting your search or there are no stores available in {selectedCity} yet.</p>
            <button className="bg-primary text-white font-mono text-sm font-bold uppercase tracking-wider px-6 py-2.5 rounded-lg shadow-md hover:bg-primary/90 active:scale-95 transition-all">
              Notify Me
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 w-full">
            {filteredStores.map((store) => (
              <div key={store.id} className="w-full sm:w-[320px]">
                <StoreCard {...store} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Buy it Again */}
      {recentProducts.length > 0 && !searchQuery && (
        <section className="px-4 md:px-0">
          <h2 className="font-bold text-xl text-ink tracking-tight mb-4">Buy it Again</h2>
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
      {topPicks.length > 0 && !searchQuery && (
        <section className="px-4 md:px-0 mb-4">
          <h2 className="font-bold text-xl text-ink tracking-tight mb-4">Top Picks For You</h2>
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
    </div>
  );
}
