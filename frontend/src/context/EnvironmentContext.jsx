import React, { createContext, useContext, useState, useCallback } from 'react';

const EnvironmentContext = createContext(null);

export function EnvironmentProvider({ children }) {
  // Modes: 'hero' (sharp, interactive), 'storefront' (soft, ambient), 'dashboard' (heavy bokeh)
  const [mode, setMode] = useState('storefront');
  
  // Signature moments triggers
  const [successTrigger, setSuccessTrigger] = useState(0);
  const [approvalTrigger, setApprovalTrigger] = useState(0);

  const triggerOrderSuccess = useCallback(() => {
    setSuccessTrigger(prev => prev + 1);
  }, []);

  const triggerStoreApproval = useCallback(() => {
    setApprovalTrigger(prev => prev + 1);
  }, []);

  return (
    <EnvironmentContext.Provider 
      value={{ 
        mode, 
        setMode, 
        triggerOrderSuccess, 
        successTrigger,
        triggerStoreApproval,
        approvalTrigger
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
}
