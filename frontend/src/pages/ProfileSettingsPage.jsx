import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Upload, User, Save, Truck, Camera } from 'lucide-react';

export function ProfileSettingsPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth(); // We'll just refresh user after update or call a checkAuth

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    profilePhotoUrl: '',
    vehicleName: '',
    vehicleModel: '',
    vehicleNumber: '',
    vehicleDocUrl: '',
    vehiclePhotoUrl: ''
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        address: user.address || '',
        profilePhotoUrl: user.profilePhotoUrl || '',
        vehicleName: user.vehicleName || '',
        vehicleModel: user.vehicleModel || '',
        vehicleNumber: user.vehicleNumber || '',
        vehicleDocUrl: user.vehicleDocUrl || '',
        vehiclePhotoUrl: user.vehiclePhotoUrl || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('folder', 'profiles');

    try {
      const response = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, [fieldName]: response.data.url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/me', formData);
      alert('Profile updated successfully!');
      // Force refresh user data by reloading window or calling checkAuth
      window.location.reload(); 
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen font-body text-ink pb-20">
      <header className="bg-surface sticky top-0 z-10 border-b border-border px-4 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-ink/5 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display font-bold text-xl">Profile Settings</h1>
      </header>

      <div className="max-w-2xl mx-auto p-4 mt-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          {/* Profile Photo */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-surface border-2 border-primary/20 flex items-center justify-center overflow-hidden">
                {formData.profilePhotoUrl ? (
                  <img src={formData.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-ink-muted" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 transition-transform">
                <Camera className="w-4 h-4" />
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'profilePhotoUrl')} disabled={uploading} />
              </label>
            </div>
            {uploading && <span className="text-xs text-ink-muted">Uploading...</span>}
          </div>

          {/* Basic Info */}
          <section className="bg-surface p-5 rounded-2xl border border-ink/5 shadow-sm">
            <h2 className="font-display font-bold text-lg mb-4">Basic Information</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-ink mb-1">Full Name</label>
                <input 
                  type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                  className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-1">Phone Number</label>
                <input 
                  type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                  className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-1">Delivery Address</label>
                <textarea 
                  name="address" value={formData.address} onChange={handleInputChange} rows={3}
                  className="w-full bg-background border border-border rounded-xl p-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  placeholder="Enter your full address"
                />
              </div>
            </div>
          </section>

          {/* Delivery Partner Vehicle Details */}
          {user?.role === 'DELIVERY_PARTNER' && (
            <section className="bg-primary/5 p-5 rounded-2xl border border-primary/20 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-lg text-primary">Vehicle Details</h2>
              </div>
              <p className="text-xs text-ink-muted mb-4">Admins will verify these details to approve your delivery account.</p>
              
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-ink mb-1">Vehicle Type / Name</label>
                  <input 
                    type="text" name="vehicleName" value={formData.vehicleName} onChange={handleInputChange}
                    className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:border-primary outline-none transition-all"
                    placeholder="e.g. Honda Activa"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-ink mb-1">Model / Year</label>
                    <input 
                      type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleInputChange}
                      className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:border-primary outline-none transition-all"
                      placeholder="e.g. 2021"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-ink mb-1">Vehicle Number</label>
                    <input 
                      type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleInputChange}
                      className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:border-primary outline-none transition-all uppercase"
                      placeholder="e.g. MH 12 AB 1234"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-ink mb-1">Vehicle Photo / RC Document</label>
                    <div className="mt-1 border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center bg-background relative overflow-hidden h-48">
                      {formData.vehicleDocUrl ? (
                        <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
                          <img src={formData.vehicleDocUrl} alt="Vehicle Doc" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                             <label className="bg-white text-ink px-4 py-2 rounded-lg text-sm font-bold cursor-pointer">
                               Change Image
                               <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'vehicleDocUrl')} disabled={uploading} />
                             </label>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                          <Upload className="w-8 h-8 text-ink-muted mb-2" />
                          <span className="text-sm font-bold text-primary">Upload Document</span>
                          <span className="text-xs text-ink-muted mt-1">PNG, JPG up to 5MB</span>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'vehicleDocUrl')} disabled={uploading} />
                        </label>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-ink mb-1">Bike Photo</label>
                    <div className="mt-1 border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center bg-background relative overflow-hidden h-48">
                      {formData.vehiclePhotoUrl ? (
                        <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
                          <img src={formData.vehiclePhotoUrl} alt="Bike Photo" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                             <label className="bg-white text-ink px-4 py-2 rounded-lg text-sm font-bold cursor-pointer">
                               Change Image
                               <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'vehiclePhotoUrl')} disabled={uploading} />
                             </label>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                          <Upload className="w-8 h-8 text-ink-muted mb-2" />
                          <span className="text-sm font-bold text-primary">Upload Bike Photo</span>
                          <span className="text-xs text-ink-muted mt-1">PNG, JPG up to 5MB</span>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'vehiclePhotoUrl')} disabled={uploading} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <Button type="submit" disabled={loading || uploading} className="w-full h-14 text-base mt-4 shadow-md">
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>

        </form>
      </div>
    </div>
  );
}
