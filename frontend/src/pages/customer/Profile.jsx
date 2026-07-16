import React, { useState, useEffect } from 'react';
import { customerApi } from '../../api/customerApi';
import ImageUploader from '../../components/ImageUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useSelector } from 'react-redux';
import { User, Phone, Mail, ShieldCheck, Camera } from 'lucide-react';

const Profile = () => {
  const { userId } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    customerApi.getProfile()
      .then((data) => { setProfile(data); setPhotoUrl(data.profilePhotoUrl || ''); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 w-full mx-auto">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">My Profile</h1>

      {/* Avatar */}
      <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-100 dark:border-gray-700/50 shadow-sm p-6 flex flex-col items-center text-center gap-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-teal/10 border-4 border-teal/20">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-teal">
                <User size={40} />
              </div>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{profile?.fullName || 'Customer'}</h2>
          <span className="px-3 py-0.5 text-xs font-bold bg-teal/10 text-teal dark:text-teal-light rounded-full">{profile?.role}</span>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-100 dark:border-gray-700/50 shadow-sm divide-y divide-gray-50 dark:divide-gray-700/40">
        {[
          { icon: Phone, label: 'Phone', value: profile?.phone },
          { icon: Mail, label: 'Email', value: profile?.email || 'Not set' },
          { icon: ShieldCheck, label: 'Trust Score', value: profile?.trustScore ?? 'N/A' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 p-4">
            <div className="w-9 h-9 rounded-xl bg-teal/10 text-teal flex items-center justify-center flex-shrink-0">
              <Icon size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Photo Upload */}
      <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-100 dark:border-gray-700/50 shadow-sm p-5 space-y-3">
        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><Camera size={16} className="text-teal" /> Update Profile Photo</h3>
        <ImageUploader
          type="profile-photo"
          label="Upload new profile photo"
          onUploadComplete={(url) => setPhotoUrl(url)}
        />
      </div>
    </div>
  );
};

export default Profile;
