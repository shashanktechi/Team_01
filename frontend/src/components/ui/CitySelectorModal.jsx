import React, { useState } from 'react';
import { useCity } from '../../context/CityContext';
import { Input } from '../ui/Input';

const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad",
  "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur"
];

export const CitySelectorModal = () => {
  const { isCityModalOpen, setIsCityModalOpen, changeCity, selectedCity } = useCity();
  const [search, setSearch] = useState('');

  if (!isCityModalOpen) return null;

  const filtered = CITIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Select your City</h2>
          {selectedCity && (
            <button onClick={() => setIsCityModalOpen(false)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="p-4 border-b border-gray-100">
          <Input 
            placeholder="Search for your city..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
            autoFocus
          />
        </div>

        <div className="p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.length > 0 ? (
            filtered.map(city => (
              <button
                key={city}
                onClick={() => changeCity(city)}
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                  selectedCity === city 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                    : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'
                }`}
              >
                {city}
              </button>
            ))
          ) : (
            <div className="col-span-full py-8 flex flex-col items-center justify-center text-center">
              <p className="text-gray-500 mb-4">No popular cities match "{search}"</p>
              <button
                onClick={() => changeCity(search.trim())}
                className="bg-primary text-surface px-6 py-2 rounded-xl font-bold font-mono uppercase tracking-wider text-sm hover:opacity-90 transition-opacity"
              >
                Use "{search}" as my location
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
