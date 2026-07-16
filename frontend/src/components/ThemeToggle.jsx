import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode } from '../app/uiSlice';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ size = 20 }) => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.ui.darkMode);

  return (
    <button
      onClick={() => dispatch(toggleDarkMode())}
      className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-300 flex items-center justify-center shadow-sm overflow-hidden group"
      aria-label="Toggle Theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {darkMode ? (
          <Sun
            size={size}
            className="text-amber-500 transition-transform duration-300 group-hover:rotate-45"
          />
        ) : (
          <Moon
            size={size}
            className="text-indigo-500 transition-transform duration-300 group-hover:-rotate-12"
          />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
