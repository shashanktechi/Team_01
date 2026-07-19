import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { TicketCard } from '../../components/ui/TicketCard';
import { BrandMark } from '../../components/ui/BrandMark';
import { api } from '../../services/api';
import { useNavigate } from 'react-router';

export const PendingApprovalPage = () => {
  const { user, logout } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();

  // Poll every 30 seconds
  useEffect(() => {
    let timeout;
    const pollStatus = async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (data.verificationStatus === 'APPROVED') {
          window.location.href = '/';
        } else {
          timeout = setTimeout(pollStatus, 30000);
        }
      } catch (err) {
        console.error("Polling error", err);
        timeout = setTimeout(pollStatus, 30000);
      }
    };
    timeout = setTimeout(pollStatus, 30000);
    return () => clearTimeout(timeout);
  }, []);

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      const { data } = await api.get('/auth/me');
      if (data.verificationStatus === 'APPROVED') {
        window.location.href = '/';
      }
    } finally {
      setIsChecking(false);
    }
  };

  const isRejected = user?.verificationStatus === 'REJECTED';

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background px-4 py-8 relative">
      <div className="absolute top-0 left-0 p-6 w-full flex justify-center md:justify-start">
        <BrandMark />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mt-16 md:mt-0">
        <TicketCard className="w-full text-center p-8 bg-chalk shadow-sm border border-ink/10">
          <div className="flex flex-col items-center">
            <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-ink ${isRejected ? 'bg-clay text-chalk' : 'bg-marigold text-ink'}`}>
              {isRejected ? (
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            
            <h2 className="mb-2 text-3xl font-display font-black text-ink">
              {isRejected ? "Application Rejected" : "Pending Approval"}
            </h2>
            
            <p className="mb-8 font-body text-ink-muted text-lg">
              {isRejected 
                ? "Unfortunately, your application to join Quick Cart has been rejected. Please contact support for more details."
                : "Your account is currently under review by our administration team. We will notify you once you're approved!"}
            </p>
            
            <div className="flex flex-col gap-4 w-full">
              {!isRejected && (
                <Button 
                  onClick={handleManualCheck} 
                  disabled={isChecking}
                  className="w-full h-12 text-lg"
                >
                  {isChecking ? 'Checking...' : 'Check Status Again'}
                </Button>
              )}
              <Button variant="outline" onClick={logout} className="w-full h-12 text-lg border-ink text-ink hover:bg-ink hover:text-chalk">
                Log Out
              </Button>
            </div>
          </div>
        </TicketCard>
      </div>
    </div>
  );
};
