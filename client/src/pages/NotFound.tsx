/**
 * Not Found (404) page component
 * 
 * This component is displayed when users navigate to non-existent routes
 */
import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        
        <div className="mt-4 mb-8">
          <h2 className="text-2xl font-semibold text-gray-700">
            Página não encontrada
          </h2>
          <p className="mt-2 text-gray-600">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Back button */}
          <button
            onClick={() => window.history.back()}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </button>
          
          {/* Home link */}
          <Link href="/dashboard">
            <a className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <Home className="w-4 h-4 mr-2" />
              Ir para o Dashboard
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;