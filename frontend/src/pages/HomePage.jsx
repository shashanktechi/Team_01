import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router';
import { StoreCard } from '../components/ui/StoreCard';
import { ProductCard } from '../components/ui/ProductCard';
import { ConflictModal } from '../components/ui/ConflictModal';
import { CategoryItem } from '../components/ui/CategoryItem';
import { LoadingSpinner3D } from '../components/ui/LoadingSpinner3D';
import { EmptyState3D } from '../components/ui/EmptyState3D';
import { api } from '../services/api';
import { useCity } from '../context/CityContext';
import { useCart } from '../context/CartContext';
import { ChevronRight, Percent, Clock, Search, Mic, MapPin, Map as MapIcon } from 'lucide-react';
import { getUserLocation, formatDistance } from '../utils/geo';
import { useEnvironment } from '../context/EnvironmentContext';

// Lazy-load the map so it doesn't bloat the initial bundle
const StoreMap = lazy(() => import('../components/ui/StoreMap'));

export function HomePage() {
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [topPicks, setTopPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { setMode } = useEnvironment();

  useEffect(() => {
    setMode('storefront');
  }, [setMode]);

  // ── Geolocation / nearby stores state ──────────────────────────────────────
  const [userLocation, setUserLocation] = useState(null);      // { lat, lng }
  const [nearbyStores, setNearbyStores] = useState([]);        // NearbyStoreDto[]
  const [geoStatus, setGeoStatus] = useState('idle');          // idle | loading | ok | denied
  const [showMap, setShowMap] = useState(false);

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

  // ── Geolocation: request on mount ─────────────────────────────────────────
  useEffect(() => {
    setGeoStatus('loading');
    getUserLocation()
      .then(async (loc) => {
        setUserLocation(loc);
        setGeoStatus('ok');
        try {
          const res = await api.get(
            `/public/stores/nearby?lat=${loc.lat}&lon=${loc.lng}&limit=20`
          );
          setNearbyStores(res.data);
        } catch (err) {
          // Nearby endpoint is optional; don't block city-based list
          console.warn('Nearby stores fetch failed:', err.message);
        }
      })
      .catch(() => setGeoStatus('denied'));
  }, []);

  // ── Fetch ALL stores + inventory (no city filter needed on frontend) ───────
  useEffect(() => {
    if (!isInitialized) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Always fetch ALL approved stores - no city filter
        const response = await api.get('/public/stores');

        const mappedStores = response.data.map(store => {
          const nearbyMatch = nearbyStores.find(n => n.id === store.id);
          return {
            id: store.id,
            name: store.name,
            city: store.city,
            bannerImage: store.bannerUrl || '/placeholder-store-banner.svg',
            logoImage: store.logoUrl || '/placeholder-store-logo.svg',
            rating: store.freshnessScore || '4.5',
            categories: 'Groceries • Fresh Produce',
            status: store.isOpen ? 'Open Now' : 'Closed',
            deliveryTime: '10-15 min',
            distance: nearbyMatch?.distanceKm != null
              ? formatDistance(nearbyMatch.distanceKm)
              : '—',
            rawStore: store
          };
        });

        // Sort by distance if we have nearby data
        if (nearbyStores.length > 0) {
          const orderMap = new Map(nearbyStores.map((n, i) => [n.id, i]));
          mappedStores.sort((a, b) => {
            const ai = orderMap.get(a.id) ?? 9999;
            const bi = orderMap.get(b.id) ?? 9999;
            return ai - bi;
          });
        }

        // Auto-detect city from the first store if no city or city is bad
        if (mappedStores.length > 0 && (!selectedCity || selectedCity === 'Madanaplle')) {
          const detectedCity = mappedStores[0].city;
          if (detectedCity) {
            localStorage.setItem('quickcart_city', detectedCity);
          }
        }

        setStores(mappedStores);
      } catch (error) {
        console.error('Failed to fetch stores', error);
        setLoading(false);
        return;
      }

      setCategories([
        { id: 1, name: 'Fruits', icon: '🍎', color: 'bg-error/10' },
        { id: 2, name: 'Vegetables', icon: '🥦', color: 'bg-primary/10' },
        { id: 3, name: 'Dairy', icon: '🥛', color: 'bg-info/10' },
        { id: 4, name: 'Snacks', icon: '🥨', color: 'bg-warning/20' },
        { id: 5, name: 'Beverages', icon: '🥤', color: 'bg-purple-500/10' },
        { id: 6, name: 'Non-Veg', icon: '🥚', color: 'bg-error/10' },
        { id: 7, name: 'Household', icon: '🧼', color: 'bg-teal-500/10' },
        { id: 8, name: 'See All', icon: '➡️', color: 'bg-surface' },
      ]);

      try {
        const invResponse = await api.get('/public/inventory');
        const mappedProducts = invResponse.data.map(inv => ({
          id: inv.product.id,
          name: inv.product.name,
          size: inv.product.sku,
          price: inv.product.unitPrice,
          mrp: inv.product.unitPrice,
          discountPercent: 0,
          image: inv.product.imageUrl || '/placeholder-product.svg',
          storeId: inv.store.id,
          storeName: inv.store.name,
          stock: inv.quantity,
          category: inv.product.category
        }));
        setAllProducts(mappedProducts);
        setTopPicks(mappedProducts.slice(0, 8));
      } catch (error) {
        console.error('Failed to fetch inventory', error);
      }

      setLoading(false);
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) return stores;
    const q = searchQuery.toLowerCase();
    return stores.filter(s => 
      (s.name || '').toLowerCase().includes(q) || 
      (s.categories || '').toLowerCase().includes(q)
    );
  }, [stores, searchQuery]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase() === q)
    );
  }, [allProducts, searchQuery]);

  // Stores that have lat/lng to show on the map
  const mapStores = nearbyStores.length > 0 ? nearbyStores : [];

  const mandiStores = useMemo(() => {
    return filteredStores.filter(s => s.rawStore?.storeType === 'MANDI');
  }, [filteredStores]);

  const regularStores = useMemo(() => {
    return mandiStores.length > 0 ? filteredStores.filter(s => s.rawStore?.storeType !== 'MANDI') : filteredStores;
  }, [filteredStores, mandiStores]);

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

      {/* Geolocation status banner */}
      {geoStatus === 'ok' && userLocation && (
        <section className="px-4 md:px-0">
          <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <MapPin className="w-4 h-4" />
              Location detected – showing nearest stores first
            </div>
            <button
              onClick={() => setShowMap(v => !v)}
              className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <MapIcon className="w-3.5 h-3.5" />
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
        </section>
      )}

      {/* Store Map */}
      {showMap && mapStores.length > 0 && (
        <section className="px-4 md:px-0">
          <Suspense fallback={
            <div className="w-full h-[350px] bg-surface rounded-2xl flex items-center justify-center text-ink-muted">
              Loading map…
            </div>
          }>
            <StoreMap
              stores={mapStores}
              userLocation={userLocation}
              height="350px"
            />
          </Suspense>
        </section>
      )}

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

      {/* Categories Grid — 3D icon chips */}
      <section className="px-4 md:px-0">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <CategoryItem
              key={cat.id}
              name={cat.name}
              image={cat.icon}
              onClick={() => setSearchQuery(cat.name === 'See All' ? '' : cat.name)}
            />
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

      {/* Mandi — Buy in Bulk Section */}
      {mandiStores.length > 0 && (
        <section className="px-4 md:px-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-xl text-ink tracking-tight flex items-center gap-2">
              🌾 Mandi — Buy in Bulk
              <span className="text-xs bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded-full font-bold">Direct Wholesale</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-4 w-full">
            {mandiStores.map((store) => (
              <div key={store.id} className="w-full sm:w-[320px]">
                <StoreCard {...store} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Nearby Stores */}
      <section className="px-4 md:px-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl text-ink tracking-tight">
            {searchQuery ? 'Matching Stores' : geoStatus === 'ok' ? '📍 Nearest Stores' : 'Nearby Stores'}
          </h2>
          {!searchQuery && (
            <span className="text-sm font-bold text-primary flex items-center cursor-pointer">
              See all <ChevronRight className="w-4 h-4 ml-1" />
            </span>
          )}
        </div>

        {loading ? (
          // Loading state with 3D spinner
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <LoadingSpinner3D size={56} />
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: '#6B6D76' }}>Finding stores near you…</p>
          </div>
        ) : regularStores.length === 0 && mandiStores.length === 0 ? (
          <EmptyState3D
            variant="crate"
            title={`No stores in "${selectedCity || 'your city'}"`}
            description="We couldn't find any stores here. Try changing your city."
            action={
              <button
                onClick={() => setIsCityModalOpen(true)}
                className="font-mono text-sm font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl text-white transition-all hover:-translate-y-0.5"
                style={{ background: '#16A34A', boxShadow: '0 0 20px rgba(22, 163, 74,0.3)' }}
              >
                Change City
              </button>
            }
          />
        ) : (
          <div className="flex flex-wrap gap-4 w-full">
            {regularStores.map((store) => (
              <div key={store.id} className="w-full sm:w-[320px]">
                <StoreCard {...store} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Filtered Products View */}
      {searchQuery && filteredProducts.length > 0 && (
        <section className="px-4 md:px-0 mt-6 mb-4">
          <h2 className="font-bold text-xl text-ink tracking-tight mb-4">Products Found</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                isOutOfStock={product.stock === 0}
                onConflict={handleConflict}
              />
            ))}
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

