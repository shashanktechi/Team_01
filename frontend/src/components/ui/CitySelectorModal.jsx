import React, { useState } from 'react';
import { useCity } from '../../context/CityContext';
import { Input } from '../ui/Input';
import { MapPin, Search } from 'lucide-react';

const CITIES = [
  "Madanapalle", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad",
  "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur",
  "Tirupati", "Kurnool", "Nellore", "Vijayawada", "Visakhapatnam",
  "Chittoor", "Kadapa", "Anantapur"
];

export const CitySelectorModal = () => {
  const { isCityModalOpen, setIsCityModalOpen, changeCity, selectedCity } = useCity();
  const [search, setSearch] = useState('');

  if (!isCityModalOpen) return null;

  const filtered = CITIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));
  const trimmedSearch = search.trim();
  // Show "Use this city" button when search text doesn't match any city
  const showCustom = trimmedSearch.length >= 2 && !CITIES.some(c => c.toLowerCase() === trimmedSearch.toLowerCase());

  const handleSelect = (city) => {
    changeCity(city);
    setSearch('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Select your City</h2>
            <p className="text-sm text-gray-500 mt-0.5">Stores in your city will be shown</p>
          </div>
          {selectedCity && (
            <button onClick={() => setIsCityModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Search for your city (e.g. Madanapalle)..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9"
              autoFocus
            />
          </div>
        </div>

        <div className="p-4 overflow-y-auto">
          {/* Custom city option */}
          {showCustom && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Use Custom City</p>
              <button
                onClick={() => handleSelect(trimmedSearch)}
                className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border-2 border-emerald-400 bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors text-sm"
              >
                <MapPin className="w-4 h-4 shrink-0" />
                Use &ldquo;{trimmedSearch}&rdquo; as my city
              </button>
            </div>
          )}

          {/* Cities grid */}
          {filtered.length > 0 && (
            <>
              <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">
                {search ? 'Matching Cities' : 'Popular Cities'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filtered.map(city => (
                  <button
                    key={city}
                    onClick={() => handleSelect(city)}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-colors flex items-center gap-2 ${
                      selectedCity === city 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' 
                        : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <MapPin className="w-3 h-3 shrink-0 text-gray-400" />
                    {city}
                  </button>
                ))}
              </div>
            </>
          )}

          {filtered.length === 0 && !showCustom && (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <MapPin className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-500">No cities match &ldquo;{search}&rdquo;</p>
              <p className="text-sm text-gray-400 mt-1">Type at least 2 characters to use a custom city</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
