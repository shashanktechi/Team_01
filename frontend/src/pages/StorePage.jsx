import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ShoppingCart, Truck, BadgeCheck, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

export function StorePage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [storeDetails, setStoreDetails] = useState(null);
  
  const { cartItems, addToCart, removeFromCart, getCartTotal, getCartCount } = useCart();

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        // Fetch store 1 for now, in a real app this comes from useParams
        const storeId = 1; 
        const response = await api.get(`/customer/stores/${storeId}/inventory`);
        
        // Maps backend Inventory array to Product array
        const mappedProducts = response.data.map(inv => ({
          id: inv.product.id,
          name: inv.product.name,
          category: inv.product.category || 'All',
          size: inv.product.unit || '1 pc',
          price: inv.product.unitPrice,
          image: inv.product.imageUrl || 'https://via.placeholder.com/150',
          stock: inv.quantity
        }));
        setProducts(mappedProducts);

        // Fetch nearby stores just to get details of this store
        const storesResponse = await api.get('/customer/stores/nearby?lat=12.9716&lng=77.5946');
        const foundStore = storesResponse.data.find(s => s.id === storeId);
        if (foundStore) setStoreDetails(foundStore);

      } catch (error) {
        console.error("Failed to fetch inventory", error);
      }
    };
    fetchInventory();
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category))];
  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const getProductQuantity = (productId) => {
    const item = cartItems.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="bg-background text-on-background min-h-screen pb-24 font-body-lg">
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-md">
        <div className="flex flex-col gap-2 px-4 py-3 w-full max-w-7xl mx-auto">
          <div className="flex justify-between items-center w-full">
            <button onClick={() => navigate(-1)} className="text-on-surface-variant hover:bg-surface-container-high transition-colors p-2 rounded-full active:scale-95 duration-200">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="font-display-lg-mobile text-display-lg-mobile text-primary tracking-tight">Quick_Cart</div>
            <button onClick={() => navigate('/cart')} className="text-on-surface-variant hover:bg-surface-container-high transition-colors p-2 rounded-full active:scale-95 duration-200 relative">
              <ShoppingCart className="h-6 w-6" />
              {getCartCount() > 0 && (
                <span className="absolute top-0 right-0 bg-error text-on-error rounded-full w-4 h-4 flex items-center justify-center font-label-md text-label-md">
                  {getCartCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-[72px] max-w-7xl mx-auto md:px-margin-desktop">
        <div className="relative w-full h-48 md:h-64 md:rounded-xl overflow-hidden shadow-sm mt-4 md:mt-0">
          <div className="bg-cover bg-center w-full h-full absolute inset-0" style={{ backgroundImage: `url('${storeDetails?.bannerUrl || 'https://via.placeholder.com/400x150'}')` }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-surface rounded-lg shadow-md flex items-center justify-center border-2 border-primary overflow-hidden">
                <img className="w-10 h-10 object-contain" alt="Store logo" src={storeDetails?.logoUrl || 'https://via.placeholder.com/64'} />
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

        <nav className="sticky top-[72px] z-40 bg-surface/90 backdrop-blur-md shadow-sm -mx-4 px-4 md:mx-0 md:px-0 py-2 border-b border-surface-variant overflow-x-auto hide-scrollbar">
          <ul className="flex gap-4 min-w-max pb-1">
            {categories.map(cat => (
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
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">{activeCategory}</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-gutter">
            {filteredProducts.map(p => {
              const qty = getProductQuantity(p.id);
              return (
                <article key={p.id} className="bg-surface-container-lowest rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-200">
                  <div className="relative aspect-square bg-surface-container-low p-2">
                    <img className="w-full h-full object-contain mix-blend-multiply" alt={p.name} src={p.image} />
                  </div>
                  <div className="p-2 flex flex-col flex-grow justify-between gap-2">
                    <div>
                      <h3 className="font-body-sm text-body-sm text-on-surface line-clamp-2">{p.name}</h3>
                      <p className="font-label-md text-label-md text-on-surface-variant mt-1">{p.size}</p>
                    </div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <div className="flex items-center gap-1">
                        <span className="font-price-sm text-price-sm text-on-surface">${p.price?.toFixed(2)}</span>
                      </div>
                      {qty > 0 ? (
                        <div className="flex items-center justify-between border border-primary rounded-lg overflow-hidden h-8">
                          <button onClick={() => removeFromCart(p.id)} className="w-8 h-full bg-primary/10 text-primary flex items-center justify-center active:bg-primary/20 transition-colors">
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-label-md text-label-md text-primary font-bold">{qty}</span>
                          <button onClick={() => addToCart(p)} className="w-8 h-full bg-primary text-on-primary flex items-center justify-center active:bg-primary-container transition-colors">
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(p)} className="w-full h-8 bg-surface-container-low border border-outline-variant text-primary font-label-md text-label-md rounded-lg flex items-center justify-center hover:bg-surface-container active:scale-95 transition-all">
                          ADD
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      {getCartCount() > 0 && (
        <div className="fixed bottom-0 left-0 w-full z-50 bg-surface shadow-[0_-8px_24px_rgba(0,0,0,0.12)] rounded-t-xl overflow-hidden p-4">
          <div onClick={() => navigate('/cart')} className="max-w-7xl mx-auto flex items-center justify-between bg-primary text-on-primary rounded-xl p-3 shadow-lg active:scale-[0.98] transition-transform duration-200 cursor-pointer">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md opacity-90">{getCartCount()} Item(s) | ${getCartTotal().toFixed(2)}</span>
              <span className="font-headline-sm text-headline-sm">View Cart</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-label-md text-label-md bg-white/20 px-2 py-1 rounded">Checkout</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
