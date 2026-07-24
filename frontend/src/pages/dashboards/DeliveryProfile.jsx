import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Loader2, User, Phone, ShieldCheck, Truck, Image, FileText, Edit2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router';

export function DeliveryProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  if (loading || !profile) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const statusColor = profile.verificationStatus === 'APPROVED' ? 'bazaar-green' : 
                      profile.verificationStatus === 'REJECTED' ? 'clay' : 'marigold';

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl text-ink">Partner Profile</h2>
          <p className="font-mono text-sm text-ink-muted mt-1 uppercase tracking-wider">Manage your documents and details</p>
        </div>
        <Button onClick={() => navigate('/profile/settings')} className="flex items-center gap-2">
          <Edit2 className="w-4 h-4" /> Edit Profile & Vehicle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <Card className="bg-surface shadow-sm border-border p-6 flex flex-col gap-6">
          <h3 className="font-display font-bold text-xl text-ink border-b border-border pb-2 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Personal Information
          </h3>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-background border border-border overflow-hidden flex items-center justify-center">
              {profile.profilePhotoUrl ? (
                <img src={profile.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-ink-muted" />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-bold text-lg text-ink">{profile.fullName || 'N/A'}</span>
              <span className="font-mono text-sm text-ink-muted">{profile.email}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                 <Phone className="w-5 h-5 text-ink-muted" />
                 <span className="font-bold text-lg text-ink">{profile.phone || 'N/A'}</span>
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

        {/* Vehicle Information */}
        <Card className="bg-surface shadow-sm border-border p-6 flex flex-col gap-6">
          <h3 className="font-display font-bold text-xl text-ink border-b border-border pb-2 flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" /> Vehicle Information
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs text-ink-muted uppercase">Vehicle Name</span>
              <span className="font-bold text-base text-ink">{profile.vehicleName || 'Not Set'}</span>
            </div>
            <div>
              <span className="block text-xs text-ink-muted uppercase">Model / Year</span>
              <span className="font-bold text-base text-ink">{profile.vehicleModel || 'Not Set'}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-xs text-ink-muted uppercase">Vehicle Number</span>
              <span className="font-bold text-base text-ink uppercase">{profile.vehicleNumber || 'Not Set'}</span>
            </div>
          </div>
        </Card>

        {/* KYC Documents */}
        <Card className="bg-surface shadow-sm border-border p-6 flex flex-col gap-6 col-span-1 md:col-span-2">
          <h3 className="font-display font-bold text-xl text-ink border-b border-border pb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> KYC Documents
          </h3>
          <p className="text-sm text-ink-muted mb-2">Upload all 6 documents to complete your KYC verification.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. SSC */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold flex items-center justify-between">
                SSC Certificate {profile.sscVerified && <ShieldCheck className="w-4 h-4 text-bazaar-green" />}
              </span>
              <ImageUploader 
                currentImageUrl={profile.sscCertUrl}
                confirmEndpoint={`/media/kyc-documents?docType=ssc`}
                onUploadSuccess={fetchProfile}
                label="Upload SSC"
              />
            </div>

            {/* 2. Inter */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold flex items-center justify-between">
                Inter Certificate {profile.interVerified && <ShieldCheck className="w-4 h-4 text-bazaar-green" />}
              </span>
              <ImageUploader 
                currentImageUrl={profile.interCertUrl}
                confirmEndpoint={`/media/kyc-documents?docType=inter`}
                onUploadSuccess={fetchProfile}
                label="Upload Inter"
              />
            </div>

            {/* 3. Driver License */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold flex items-center justify-between">
                Driver License {profile.driverLicenseVerified && <ShieldCheck className="w-4 h-4 text-bazaar-green" />}
              </span>
              <ImageUploader 
                currentImageUrl={profile.driverLicenseUrl}
                confirmEndpoint={`/media/kyc-documents?docType=driverLicense`}
                onUploadSuccess={fetchProfile}
                label="Upload License"
              />
            </div>

            {/* 4. Bike RC */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold flex items-center justify-between">
                Bike RC {profile.bikeRcVerified && <ShieldCheck className="w-4 h-4 text-bazaar-green" />}
              </span>
              <ImageUploader 
                currentImageUrl={profile.bikeRcUrl}
                confirmEndpoint={`/media/kyc-documents?docType=bikeRc`}
                onUploadSuccess={fetchProfile}
                label="Upload Bike RC"
              />
            </div>

            {/* 5. Other Cert */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold flex items-center justify-between">
                Other Certificate {profile.otherCertVerified && <ShieldCheck className="w-4 h-4 text-bazaar-green" />}
              </span>
              <ImageUploader 
                currentImageUrl={profile.otherCertUrl}
                confirmEndpoint={`/media/kyc-documents?docType=otherCert`}
                onUploadSuccess={fetchProfile}
                label="Upload Other"
              />
            </div>

            {/* 6. Aadhar */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold flex items-center justify-between">
                Aadhar Card {profile.aadharVerified && <ShieldCheck className="w-4 h-4 text-bazaar-green" />}
              </span>
              <ImageUploader 
                currentImageUrl={profile.aadharUrl}
                confirmEndpoint={`/media/kyc-documents?docType=aadhar`}
                onUploadSuccess={fetchProfile}
                label="Upload Aadhar"
              />
            </div>
            
          </div>
        </Card>
      </div>
    </div>
  );
}
