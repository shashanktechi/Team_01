import React from 'react';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export function ConflictModal({ isOpen, conflictStoreName, targetStoreName, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
      <div className="bg-chalk rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4 text-error">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="font-display font-bold text-xl text-ink leading-tight mb-2">Replace cart item?</h3>
        <p className="font-body text-sm text-ink-muted mb-6">
          Your cart contains items from <span className="font-bold text-ink">{conflictStoreName}</span>. 
          Do you want to discard the selection and add items from <span className="font-bold text-ink">{targetStoreName}</span>?
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={onConfirm} variant="marigold" className="w-full text-ink font-bold">
            Clear cart and add
          </Button>
          <Button onClick={onCancel} variant="outline" className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
