import React, { createContext, useContext, useState, useEffect } from 'react';

const CityContext = createContext();

export function CityProvider({ children }) {
  const [selectedCity, setSelectedCity] = useState(null);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('quickcart_city');
    if (saved) {
      setSelectedCity(saved);
    }
    setIsInitialized(true);
  }, []);

  const changeCity = (city) => {
    setSelectedCity(city);
    localStorage.setItem('quickcart_city', city);
    setIsCityModalOpen(false);
  };

  return (
    <CityContext.Provider value={{
      selectedCity,
      isCityModalOpen,
      setIsCityModalOpen,
      changeCity,
      isInitialized
    }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  return useContext(CityContext);
}
