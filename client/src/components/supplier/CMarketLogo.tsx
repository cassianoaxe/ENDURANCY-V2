import React from 'react';

export const CMarketLogo = () => {
  return (
    <div className="flex items-center">
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2"
      >
        <rect width="40" height="40" rx="8" fill="#4F46E5" />
        <path d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M20 28C17.7909 28 16 26.2091 16 24C16 21.7909 17.7909 20 20 20C22.2091 20 24 21.7909 24 24C24 26.2091 22.2091 28 20 28Z" fill="#10B981" stroke="white" strokeWidth="1.5"/>
        <path d="M20 20V12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          <span className="text-indigo-600">C</span>Market
        </h1>
        <p className="text-xs text-gray-500">Marketplace para Fornecedores</p>
      </div>
    </div>
  );
};