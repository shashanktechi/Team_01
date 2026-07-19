import React, { useState, useEffect } from 'react';
import { CategoryItem } from '../components/ui/CategoryItem';
import { StoreCard } from '../components/ui/StoreCard';
import { ProductCard } from '../components/ui/ProductCard';
import { api } from '../services/api';
import { useCity } from '../context/CityContext';

export function HomePage() {
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { selectedCity, isInitialized, setIsCityModalOpen } = useCity();

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
          bannerImage: store.bannerUrl || 'https://via.placeholder.com/400x150',
          logoImage: store.logoUrl || 'https://via.placeholder.com/64',
          rating: store.freshnessScore || '4.5',
          categories: 'Groceries • Fresh Produce',
          status: store.isOpen ? 'Open Now' : 'Closed',
          deliveryTime: '10-15 min'
        }));
        setStores(mappedStores);
      } catch (error) {
        console.error("Failed to fetch stores", error);
      }

      setCategories([
        { id: 1, name: 'Fruits', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVlXNACn8VbMmvmcH5RjO1WtJTmqrVGMsSBUCww44IPhGSU9v2hFiwORzG4-HH8AjRJe6rFXrx7gDGkeOTNwc0CdJ7n5ce67SmFPVt-M7XbkhLgj2yWRick6NgUzpTB2RRI9B2GGgaO1yhXIO5QmZqJfFZgSkullBFxLht5Bew3it2ZZ_ErvESWb0ZlnABjqNiX_2vGULn3YRUMfKMocWv7rmoJE0rThbfAQvnzlhYyL5T7tXJUIJ4' },
        { id: 2, name: 'Veggies', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAz1B9z-EGiLtrguZAsoO3hfI_V0pZHeQ0nPbQNxwRHPeeBUQT2FhgTij_M7HItitJyBEH4P2ZhVFeZBpZOyY3J1ddtWGP7ZQhBIRFZWe7K03EjJcB5Y858jEbHdLrdjtvG6Ut8GgbFv8aTXXGHmagmAjY-eV8CFNfMN_-CxmV3uZUni27ckfBkjtbOJzhWimYAw3TfoomM7jG5XyVlB7ij-Q-kI3GNvYztSOH7V8vbpjjePEKa-9r9' },
        { id: 3, name: 'Dairy', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnIoWIeiZM1PMq7ETY8iITtKwNJIEPypXQcb8E401WlRBfTkTglf3-n8X8QKTdNRDEGgD7pBsemNibloMRchq5scS_WtV9gMiFgaFSVtce4laPBRVrEXtTzuFRYcBuRNVT452l8QbPg0dcEQXS6Tlh4Uqv2ZSovjKLS_7sR33xW5-9e4ZtiBsKprRmWPfGMBLS_2fV1zD42Q2Sk5-ARc7JW2WEPTmeA-nEFSgI8Y7FqNNYAQ87lCGi' },
        { id: 4, name: 'Snacks', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAo-BR7mUB45uDsFyefW9gv7XGH7YnVht63UbFvVIJk4dVSDxTFg-XIKs_Qems5uJbxJoMUw-3wiESNzkZCNmmDU2iLPO5uFu5jIaBTH1VSzHISYRIKAD7MQSkyMKIh15aIIpyCzRzriaqrTi8mIjRGZ8OPJPlIUe1I8YtkOv-Tg1u86NPdKCyH5ZlgFdmYSVaF9okMWJvX4_y61oSQ47nSUc9sjDkT_vzIx8VZSFMsxM6QZovbUAs' },
        { id: 5, name: 'Bakery', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOItiug0evqEW08Dsl0tY9dzT0ktauu-YBgfNoEovs02h1EB5CJjwvXDODyLchOh1kpIt9gAU8IJtIFqYCU4q5fp9HWHv8y96JYyZWzpRBj6JqdPeOsBSTYSNOR_PI7Wb-s8OKFEyrf71UXdqi0ir4kCr1WHdDYRtHjjuRrLn9kLO1-bXr5eU4NLswQGCyuTZK_RamBOcRydEXeeUF7NCPbiDGqhMMy1YPHP_5CGtCztryD5aCwqjp' },
        { id: 6, name: 'Drinks', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXukrMFX_JAsN7BcvggMqHH_GHxH_AL8-3fxp2Vdy_W6n_vRQvccmCYlhATuwkVNpajJNwE2JlC3Rv869UQeAjSeIf4OLIsWwUKEEq6CjC1dx5CWwPAQTILSaS2kDUEqyNG0ZtEGjz36Oj8zoFLHNJ3fEZQFN83KKO2VQdtbDaQFGCtqcx3nL-9araMsMhdHgGDJRZnnjXSFTRMmp4HvuarFnAk-mFMXAqh0jwsZWtDfiXvHWUi0sf' },
      ]);

      setRecentProducts([
        {
          id: 1,
          name: 'Whole Wheat Bread',
          size: '400g',
          price: 2.49,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXNzLbYy6lBVf0_JBL9zGYdcO9DLSQ0OCuhRgt9kgDG_cWv3yUjj-BHfRs8JCYYm1x7knVEnBOPrgcd3LM3UTo2jlAh95dbE4UzBxs5vIHTqRvIeIjLvJDMasV9EP6rvT8Yt8CYXZNuOnLoFeTtZnAwBCy68ER2m_owN7tcoMH-3mB3RbWw4_IdaGFz0cqWCK08hIuvOhSWBIVP87hWXDbEePQjr3K7cplZQPUXaV9mgkZ22ZPAP60'
        },
        {
          id: 2,
          name: 'Fresh Whole Milk',
          size: '1 Gallon',
          price: 4.99,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5eOFJrXvchMieqbtBP5PkXQ68Rc6u1X_-TP8VpGtrnwVpRKosUv_Kwui7NVWAX_5Rw-sFlfxSPG3OyTGeKe8xP2Oi86k9yYNsQfjn9ERkp0lJJXHzeLoX-2LPVRJu-1-If6r7_Q0UptY_e4RxxWvoy2rexjhdYh-e1hr_pGRYZBKqiDtsALkClk-4rhX0KKkPdyzZUQZ7PbPdmdwyAoI1oxgXEmjtGTravssS7C4UHQ3GKd-pZB7c'
        }
      ]);

      setLoading(false);
    };

    fetchData();
  }, [isInitialized, selectedCity, setIsCityModalOpen]);

  return (
    <>
      <section className="flex flex-col gap-4">
        <h2 className="font-display font-black text-2xl text-ink tracking-tight mb-2">Categories</h2>
        <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar">
          {categories.map((cat) => (
            <CategoryItem key={cat.id} name={cat.name} image={cat.image} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display font-black text-2xl text-ink tracking-tight mb-2 mt-4">Nearby Stores</h2>
        {stores.length === 0 && !loading ? (
          <div className="bg-chalk border border-ink/10 shadow-sm rounded-xl p-8 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-kraft rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🏪</span>
            </div>
            <h3 className="font-display font-bold text-xl text-ink mb-2">No stores available</h3>
            <p className="font-body text-ink-muted">There are no stores available in {selectedCity} yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <StoreCard key={store.id} {...store} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display font-black text-2xl text-ink tracking-tight mb-2 mt-4">Buy it Again</h2>
        <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
          {recentProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              {...product} 
              onAdd={() => console.log('Added', product.id)}
            />
          ))}
        </div>
      </section>
    </>
  );
}
