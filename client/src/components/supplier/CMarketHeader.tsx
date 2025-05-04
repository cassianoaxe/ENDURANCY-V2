import React, { useState } from 'react';
import { Search, Plus, Bell, MessageCircle, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CMarketLogo } from './CMarketLogo';
import { Link } from 'wouter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CMarketHeaderProps {
  onSearch?: (query: string) => void;
  onCategoryChange?: (category: string) => void;
  onStatusChange?: (status: string) => void;
  categories?: { id: number; name: string }[];
}

export const CMarketHeader: React.FC<CMarketHeaderProps> = ({
  onSearch,
  onCategoryChange,
  onStatusChange,
  categories = []
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <div className="border-b">
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <Link href="/supplier/cmarket">
              <a className="flex items-center">
                <CMarketLogo />
              </a>
            </Link>
          </div>

          <form 
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-2xl"
          >
            <div className="relative">
              <Input
                type="search"
                placeholder="Pesquisar anúncios de compra..."
                className="w-full pl-10 h-10"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button 
                type="submit"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          <div className="flex items-center space-x-2">
            {user && (
              <>
                <Link href="/supplier/cmarket/notifications">
                  <Button variant="ghost" size="icon" aria-label="Notificações">
                    <Bell size={20} />
                  </Button>
                </Link>
                <Link href="/supplier/cmarket/messages">
                  <Button variant="ghost" size="icon" aria-label="Mensagens">
                    <MessageCircle size={20} />
                  </Button>
                </Link>
                <Link href="/supplier/cmarket/announcement/new">
                  <Button>
                    <Plus size={16} className="mr-2" />
                    Novo Anúncio
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>
          
          <div className="w-40">
            <Select onValueChange={onCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-40">
            <Select onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Abertos</SelectItem>
                <SelectItem value="closed">Fechados</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};