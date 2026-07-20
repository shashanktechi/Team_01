import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader2, Save } from 'lucide-react';
import { TicketCard } from '../../components/ui/TicketCard';
import { ImageUploader } from '../../components/ui/ImageUploader';

export function StoreAdminProfile({ storeId }) {
  const [profile, setProfile] = useState({
    name: '',
    address: '',
    city: '',
    whatsappNumber: '',
    isOpen: false,
    logoUrl: '',
    bannerUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/store/profile');
      if (res.data.store) {
        setProfile({
          name: res.data.store.name || '',
          address: res.data.store.address || '',
          city: res.data.store.city || '',
          whatsappNumber: res.data.store.whatsappNumber || '',
          isOpen: res.data.store.isOpen || false,
          logoUrl: res.data.store.logoUrl || '',
          bannerUrl: res.data.store.bannerUrl || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/store/profile', {
        name: profile.name,
        address: profile.address,
        city: profile.city,
        whatsappNumber: profile.whatsappNumber,
        isOpen: profile.isOpen
      });
      alert('Profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoSuccess = (url) => {
      setProfile(prev => ({ ...prev, logoUrl: url }));
  };

  const handleBannerSuccess = (url) => {
      setProfile(prev => ({ ...prev, bannerUrl: url }));
  };

  if (loading || !storeId) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-bazaar-green" /></div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h2 className="font-display font-black text-2xl text-ink">Store Profile</h2>
        <p className="font-mono text-sm text-ink-muted mt-1 uppercase tracking-wider">Manage your store details and branding</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TicketCard className="bg-chalk shadow-sm border-ink/10 p-6">
          <h3 className="font-display font-bold text-xl mb-4 text-ink border-b border-ink/10 pb-2">General Info</h3>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Store Name</label>
              <Input required value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Address</label>
              <Input required value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">City</label>
              <Input required value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">WhatsApp Number</label>
              <Input required value={profile.whatsappNumber} onChange={e => setProfile({...profile, whatsappNumber: e.target.value})} />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="isOpenToggle"
                checked={profile.isOpen}
                onChange={e => setProfile({...profile, isOpen: e.target.checked})}
                className="w-4 h-4 text-bazaar-green rounded focus:ring-bazaar-green"
              />
              <label htmlFor="isOpenToggle" className="text-sm font-bold">Store is Currently Open for Orders</label>
            </div>
            <div className="mt-4">
              <Button type="submit" disabled={saving} className="flex items-center gap-2 w-full sm:w-auto">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Profile
              </Button>
            </div>
          </form>
        </TicketCard>

        <div className="flex flex-col gap-6">
            <TicketCard className="bg-chalk shadow-sm border-ink/10 p-6">
              <h3 className="font-display font-bold text-xl mb-4 text-ink border-b border-ink/10 pb-2">Store Logo</h3>
              <p className="text-sm text-ink-muted mb-4">Upload a square image to represent your store across the platform.</p>
              <ImageUploader 
                  currentImageUrl={profile.logoUrl}
                  uploadEndpoint={`/media/store/${storeId}/logo/upload-url`}
                  confirmEndpoint={`/media/store/${storeId}/logo`}
                  onUploadSuccess={handleLogoSuccess}
                  label="Update Logo"
              />
            </TicketCard>

            <TicketCard className="bg-chalk shadow-sm border-ink/10 p-6">
              <h3 className="font-display font-bold text-xl mb-4 text-ink border-b border-ink/10 pb-2">Store Banner</h3>
              <p className="text-sm text-ink-muted mb-4">Upload a wide banner image that appears at the top of your store page.</p>
              <ImageUploader 
                  currentImageUrl={profile.bannerUrl}
                  uploadEndpoint={`/media/store/${storeId}/banner/upload-url`}
                  confirmEndpoint={`/media/store/${storeId}/banner`}
                  onUploadSuccess={handleBannerSuccess}
                  label="Update Banner"
              />
            </TicketCard>
        </div>
      </div>
    </div>
  );
}
