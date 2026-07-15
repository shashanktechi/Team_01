import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode } from '../app/uiSlice';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.ui.darkMode);

  return (
    <button
      onClick={() => dispatch(toggleDarkMode())}
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200/55 dark:border-gray-700/50 transition-all duration-200 flex items-center justify-center"
      aria-label="Toggle Theme"
    >
      {darkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;
