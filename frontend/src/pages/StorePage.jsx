import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { ArrowLeft, ShoppingCart, Truck, BadgeCheck, Plus, Minus, Star, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { BrandMark } from '../components/ui/BrandMark';
import { ProductCard } from '../components/ui/ProductCard';
import { ConflictModal } from '../components/ui/ConflictModal';

export function StorePage() {
  const navigate = useNavigate();
  const { id: storeId } = useParams();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [storeDetails, setStoreDetails] = useState(location.state?.storeDetails || null);
  const [conflictState, setConflictState] = useState({ isOpen: false });
  
  const { cartItems, addToCart, removeFromCart, clearCart, getCartTotal, getCartCount } = useCart();

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        if (!storeDetails) {
          const storeResponse = await api.get(`/public/stores/${storeId}`);
          setStoreDetails(storeResponse.data);
        }

        const response = await api.get(`/public/stores/${storeId}/inventory`);
        
        // Maps backend Inventory array to Product array
        const mappedProducts = response.data.map(inv => ({
          id: inv.product.id,
          name: inv.product.name,
          category: inv.product.category || 'All',
          size: inv.product.unit || '1 pc',
          price: inv.product.unitPrice,
          image: inv.product.imageUrl || '/placeholder-product.svg',
          stock: inv.quantity
        }));
        setProducts(mappedProducts);
      } catch (error) {
        console.error("Failed to fetch inventory", error);
      }
    };
    fetchInventory();
  }, [storeId]);

  const categories = ['All', ...new Set(products.map(p => p.category))];
  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

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

  return (
    <div className="bg-kraft text-ink min-h-screen pb-24 font-body">
      <ConflictModal {...conflictState} />
      <header className="fixed top-0 w-full z-50 bg-kraft/90 backdrop-blur-md border-b border-ink/10">
        <div className="flex flex-col gap-2 px-4 py-3 w-full">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/stores')}
              className="p-1 hover:bg-surface-variant rounded-full transition-colors active:scale-95 text-on-surface-variant"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex-1">
              <h1 className="font-display font-bold text-lg text-ink leading-tight truncate">{storeDetails?.name || 'Loading...'}</h1>
              <p className="font-body text-xs text-ink-muted flex items-center gap-1">
                <span className="flex items-center text-bazaar-green font-medium"><Star className="h-3 w-3 fill-bazaar-green mr-0.5"/> 4.8</span>
                <span>•</span>
                <span>10-15 min</span>
              </p>
            </div>
            <button className="p-2 text-ink hover:bg-surface-variant rounded-full transition-colors active:scale-95">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="pt-[72px] w-full md:px-margin-desktop">
        <div className="relative w-full h-48 md:h-64 md:rounded-xl overflow-hidden shadow-sm mt-4 md:mt-0">
          <div className="bg-cover bg-center w-full h-full absolute inset-0" style={{ backgroundImage: `url('${storeDetails?.bannerUrl || '/placeholder-store-banner.svg'}')` }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-surface rounded-lg shadow-md flex items-center justify-center border-2 border-primary overflow-hidden">
                <img className="w-10 h-10 object-contain" alt="Store logo" src={storeDetails?.logoUrl || '/placeholder-store-logo.svg'} />
              </div>
              <div>
                <h1 className="font-headline-md text-headline-md text-white">{storeDetails?.name || 'Loading Store...'}</h1>
                <p className="font-body-sm text-body-sm text-white/80 flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" /> Delivery in 10 mins
                </p>
              </div>
            </div>
            <div className="absolute top-4 right-4 bg-primary-container text-on-primary-container font-label-md text-label-md px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
              <BadgeCheck className="h-3.5 w-3.5" /> Freshness: {storeDetails?.freshnessScore || 98}%
            </div>
          </div>
        </div>

        <nav className="sticky top-[72px] z-40 bg-kraft/90 backdrop-blur-md shadow-sm -mx-4 px-4 md:mx-0 md:px-0 py-2 border-b border-ink/10 overflow-x-auto hide-scrollbar">
          <ul className="flex gap-4 min-w-max pb-1">
            {categories.map(cat => (
              <li key={cat}>
                <button onClick={() => setActiveCategory(cat)} className="active:scale-95 transition-transform group">
                  <Badge variant={activeCategory === cat ? 'marigold' : 'chalk'} className="px-4 py-2 group-hover:-translate-y-0.5 transition-transform">
                    {cat}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <section className="p-margin-mobile md:p-0 md:py-margin-desktop">
          <h2 className="font-display font-black text-2xl text-ink tracking-tight mb-4">{activeCategory}</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {filteredProducts.map(p => (
              <ProductCard 
                key={p.id}
                id={p.id}
                name={p.name}
                size={p.size}
                price={p.price}
                mrp={p.price * 1.2} // Dummy MRP for demonstration
                discountPercent={15} // Dummy discount for demonstration
                image={p.image}
                storeId={storeDetails?.id}
                storeName={storeDetails?.name}
                isOutOfStock={p.stock === 0}
                onConflict={handleConflict}
              />
            ))}
          </div>
        </section>
      </main>

      {getCartCount() > 0 && (
        <div className="fixed bottom-0 left-0 w-full z-50 bg-kraft border-t border-ink/10 p-4">
          <div onClick={() => navigate('/cart')} className="max-w-7xl mx-auto flex items-center justify-between bg-ink text-chalk p-4 border border-ink/20 shadow-[4px_4px_0px_var(--color-ink)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0px_var(--color-ink)] transition-all cursor-pointer">
            <div className="flex flex-col">
              <span className="font-mono text-xs uppercase tracking-widest text-chalk/70">{getCartCount()} Item(s) | ${getCartTotal().toFixed(2)}</span>
              <span className="font-display font-black text-xl tracking-tight text-marigold">View Cart</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-widest bg-marigold text-ink px-3 py-1.5 border border-ink">Checkout</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
