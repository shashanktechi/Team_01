import React, { useState, useEffect } from 'react';
import { storeApi } from '../../api/storeApi';
import ImageUploader from '../../components/ImageUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useSelector } from 'react-redux';
import { Store, Camera, Image, Phone } from 'lucide-react';

const StoreProfile = () => {
  const { storeId } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storeApi.getStoreProfile()
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const store = profile?.store || {};
  const user = profile?.user || {};

  return (
    <div className="space-y-6 w-full mx-auto">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Store Profile</h1>

      {/* Store Header */}
      <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
        {store.bannerUrl && (
          <img src={store.bannerUrl} alt="Banner" className="w-full h-28 object-cover" />
        )}
        <div className="p-5 flex gap-4 items-start">
          {store.logoUrl ? (
            <img src={store.logoUrl} alt="Logo" className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-gray-700 shadow-md" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-teal/10 dark:bg-teal-light/10 text-teal dark:text-teal-light flex items-center justify-center">
              <Store size={28} />
            </div>
          )}
          <div>
            <h2 className="font-extrabold text-gray-900 dark:text-white text-lg">{store.name || 'Your Store'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{store.address}</p>
            <span className={`mt-1 inline-block px-2.5 py-0.5 text-xs font-bold rounded-full ${store.verificationStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/25 dark:text-amber-400'}`}>
              {store.verificationStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-100 dark:border-gray-700/50 shadow-sm divide-y divide-gray-50 dark:divide-gray-700/40">
        {[
          { icon: Phone, label: 'Owner Phone', value: user.phone },
          { icon: Store, label: 'Freshness Score', value: store.freshnessScore ? parseFloat(store.freshnessScore).toFixed(1) : 'N/A' },
          { icon: Store, label: 'Store Status', value: store.isOpen ? 'Open' : 'Closed' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 p-4">
            <div className="w-9 h-9 rounded-xl bg-teal/10 text-teal flex items-center justify-center flex-shrink-0"><Icon size={16} /></div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Logo Upload */}
      <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-100 dark:border-gray-700/50 shadow-sm p-5 space-y-3">
        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><Camera size={16} className="text-teal" /> Store Logo</h3>
        <ImageUploader type="store-logo" options={{ storeId }} label="Upload store logo" onUploadComplete={() => {}} />
      </div>

      {/* Banner Upload */}
      <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-100 dark:border-gray-700/50 shadow-sm p-5 space-y-3">
        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><Image size={16} className="text-teal" /> Store Banner</h3>
        <ImageUploader type="store-banner" options={{ storeId }} label="Upload store banner" onUploadComplete={() => {}} />
      </div>
    </div>
  );
};

export default StoreProfile;
