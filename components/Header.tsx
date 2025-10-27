
import React from 'react';
import { StethoscopeIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="w-full max-w-4xl mb-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
            <StethoscopeIcon className="w-10 h-10 text-primary-500" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                MediScribe
            </h1>
        </div>
      <p className="text-md text-gray-600 dark:text-gray-300">
        Asistentul tău AI pentru documentație medicală rapidă.
      </p>
    </header>
  );
};

export default Header;
