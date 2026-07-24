import React, { useEffect } from 'react';
import { Check } from 'lucide-react';

export function SuccessAnimation3D({ onComplete }) {
  useEffect(() => {
    const t = setTimeout(() => { if (onComplete) onComplete(); }, 1500);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)' }}>
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-white"
        style={{
          background: 'var(--color-primary, #16A34A)',
          boxShadow: '0 0 60px rgba(22, 163, 74, 0.4)',
          animation: 'successPop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <Check size={48} strokeWidth={3} />
      </div>
      <style>{`
        @keyframes successPop {
          from { transform: scale(0) rotate(-90deg); opacity: 0; }
          to { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default SuccessAnimation3D;
