import React, { useState } from 'react';
import { Link } from 'wouter';
import { CMarketLogo } from './CMarketLogo';
import { Search, ShoppingCart, User, Heart, Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';

export const CMarketHeader: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const categories = [
    { name: 'Categorias', path: '/supplier/cmarket/categories' },
    { name: 'Equipamentos', path: '/supplier/cmarket/equipamentos' },
    { name: 'Suprimentos', path: '/supplier/cmarket/suprimentos' },
    { name: 'Vidrarias', path: '/supplier/cmarket/vidrarias' },
    { name: 'Reagentes', path: '/supplier/cmarket/reagentes' },
    { name: 'EPIs', path: '/supplier/cmarket/epis' },
    { name: 'Editais de Compra', path: '/supplier/cmarket/editais' },
    { name: 'Usados', path: '/supplier/cmarket/usados' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica de busca
    console.log('Buscando por:', searchQuery);
  };

  return (
    <header className="w-full">
      {/* Barra superior amarela */}
      <div className="bg-[#FFE600] px-4 py-3 shadow-sm">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo e busca */}
          <div className="flex w-full items-center gap-4">
            <Link href="/supplier/cmarket">
              <a className="flex-shrink-0">
                <CMarketLogo />
              </a>
            </Link>
            
            <form onSubmit={handleSearch} className="flex-grow max-w-xl">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar produtos, marcas e mais..."
                  className="w-full pl-4 pr-10 py-2 rounded-md shadow-sm border-gray-200 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-0 top-0 h-full px-3 text-gray-500"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </div>
          
          {/* Menu do usuário - visível apenas em desktop */}
          <div className="hidden md:flex items-center gap-5">
            <Link href="/supplier/cmarket/favoritos">
              <a className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm">
                <Heart className="h-5 w-5" />
                <span className="hidden lg:inline">Favoritos</span>
              </a>
            </Link>
            
            <Link href="/supplier/cmarket/notificacoes">
              <a className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm">
                <Bell className="h-5 w-5" />
                <span className="hidden lg:inline">Notificações</span>
              </a>
            </Link>
            
            <Link href="/supplier/cmarket/cart">
              <a className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm">
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden lg:inline">Carrinho</span>
              </a>
            </Link>
            
            <Link href={user ? "/supplier/cmarket/account" : "/auth"}>
              <a className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm">
                <User className="h-5 w-5" />
                <span className="hidden lg:inline">{user ? user.username : 'Entrar'}</span>
              </a>
            </Link>
          </div>
          
          {/* Botão de menu mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      {/* Barra de categorias */}
      <nav className="bg-white shadow-sm px-4 py-2 overflow-x-auto">
        <div className="container mx-auto">
          <ul className="flex space-x-6 whitespace-nowrap">
            {categories.map((category, index) => (
              <li key={index}>
                <Link href={category.path}>
                  <a className="text-sm text-gray-700 hover:text-blue-600 transition-colors">
                    {category.name}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      
      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg p-4">
          <nav className="flex flex-col gap-4">
            <Link href="/supplier/cmarket/favoritos">
              <a className="text-gray-700 flex items-center gap-2 py-2">
                <Heart className="h-5 w-5" />
                <span>Favoritos</span>
              </a>
            </Link>
            
            <Link href="/supplier/cmarket/notificacoes">
              <a className="text-gray-700 flex items-center gap-2 py-2">
                <Bell className="h-5 w-5" />
                <span>Notificações</span>
              </a>
            </Link>
            
            <Link href="/supplier/cmarket/cart">
              <a className="text-gray-700 flex items-center gap-2 py-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Carrinho</span>
              </a>
            </Link>
            
            <Link href={user ? "/supplier/cmarket/account" : "/auth"}>
              <a className="text-gray-700 flex items-center gap-2 py-2">
                <User className="h-5 w-5" />
                <span>{user ? user.username : 'Entrar'}</span>
              </a>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};