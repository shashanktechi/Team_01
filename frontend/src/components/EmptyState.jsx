import React from 'react';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({ title = 'No items found', description = 'Check back later or try adjusting your filters.', icon: Icon = PackageOpen }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-gray-800 rounded-card shadow-sm border border-gray-100 dark:border-gray-700/50 py-16">
      <div className="w-16 h-16 rounded-full bg-teal/10 text-teal dark:bg-teal-light/10 dark:text-teal-light flex items-center justify-center mb-4">
        <Icon size={28} />
      </div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1.5">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 w-full">{description}</p>
    </div>
  );
};

export default EmptyState;
