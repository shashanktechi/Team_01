import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Loader2, User, Phone, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ImageUploader } from '../../components/ui/ImageUploader';

export function DeliveryProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/delivery/profile');
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch delivery profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleDocumentSuccess = (url) => {
    setProfile(prev => ({ ...prev, vehicleDocUrl: url }));
  };

  if (loading || !profile) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const statusColor = profile.verificationStatus === 'APPROVED' ? 'bazaar-green' : 
                      profile.verificationStatus === 'REJECTED' ? 'clay' : 'marigold';

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h2 className="font-display font-black text-2xl text-ink">Partner Profile</h2>
        <p className="font-mono text-sm text-ink-muted mt-1 uppercase tracking-wider">Manage your documents and details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-surface shadow-sm border-border p-6 flex flex-col gap-6">
          <h3 className="font-display font-bold text-xl text-ink border-b border-border pb-2">Personal Information</h3>
          
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                 <User className="w-5 h-5 text-ink-muted" />
                 <span className="font-bold text-lg">{profile.fullName || 'N/A'}</span>
             </div>
          </div>

          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                 <Phone className="w-5 h-5 text-ink-muted" />
                 <span className="font-bold text-lg">{profile.phone || 'N/A'}</span>
             </div>
          </div>

          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                 <ShieldCheck className="w-5 h-5 text-ink-muted" />
                 <span className="font-mono font-bold uppercase tracking-wider text-sm">Status</span>
             </div>
             <Badge variant={statusColor}>{profile.verificationStatus || 'PENDING'}</Badge>
          </div>
        </Card>

        <Card className="bg-surface shadow-sm border-border p-6 flex flex-col gap-4">
          <h3 className="font-display font-bold text-xl text-ink border-b border-border pb-2">Vehicle Documents</h3>
          <p className="text-sm text-ink-muted">Upload a clear photo of your vehicle registration or driving license to maintain your active status.</p>
          
          <ImageUploader 
            currentImageUrl={profile.vehicleDocUrl}
            uploadEndpoint="/media/delivery/vehicle-doc/upload-url"
            confirmEndpoint="/media/delivery/vehicle-doc"
            onUploadSuccess={handleDocumentSuccess}
            label="Upload Document"
          />
        </Card>
      </div>
    </div>
  );
}
