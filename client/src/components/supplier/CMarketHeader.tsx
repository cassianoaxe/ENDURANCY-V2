import React from 'react';
import { Search, Bell, ShoppingCart, UserCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CMarketLogo } from './CMarketLogo';
import { Link } from 'wouter';

export const CMarketHeader = () => {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto py-3 px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/supplier/cmarket">
              <CMarketLogo />
            </Link>
          </div>
          
          {/* Barra de pesquisa */}
          <div className="hidden md:flex flex-1 mx-6">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input 
                type="search" 
                placeholder="Buscar produtos ou editais de compra..." 
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </div>
          
          {/* Ações */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="p-2 text-gray-700">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="outline" className="p-2 text-gray-700">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" className="hidden md:flex items-center text-sm">
              <UserCircle className="h-5 w-5 mr-2" />
              Minha Conta
            </Button>
            <Button variant="default" className="hidden sm:inline-flex">
              Publicar Anúncio
            </Button>
          </div>
        </div>
        
        {/* Barra de pesquisa (mobile) */}
        <div className="mt-3 md:hidden">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input 
              type="search" 
              placeholder="Buscar produtos ou editais..." 
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>
      </div>
    </header>
  );
};