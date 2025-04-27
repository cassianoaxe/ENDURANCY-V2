import React from 'react';
import LaboratorySidebar from './LaboratorySidebar';
import { Separator } from '@/components/ui/separator';
import { useLocation } from 'wouter';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface LaboratoryLayoutProps {
  children: React.ReactNode;
}

export default function LaboratoryLayout({ children }: LaboratoryLayoutProps) {
  const [location] = useLocation();
  const pathParts = location.split('/').filter(Boolean);
  
  // Obter título da página atual
  const getPageTitle = () => {
    if (location === '/laboratory/dashboard') return 'Dashboard';
    if (location.startsWith('/laboratory/samples')) return 'Gestão de Amostras';
    if (location.startsWith('/laboratory/tests')) return 'Gerenciamento de Testes';
    if (location.startsWith('/laboratory/equipment')) return 'Equipamentos';
    if (location.startsWith('/laboratory/reports')) return 'Relatórios';
    if (location.startsWith('/laboratory/clients')) return 'Clientes';
    if (location.startsWith('/laboratory/settings')) return 'Configurações';
    return 'Portal de Laboratório';
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-white px-4 md:px-6">
        <div className="md:hidden mr-2">
          <Sheet>
            <SheetTrigger asChild>
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <LaboratorySidebar />
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-4 w-4 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              type="search"
              className="rounded-md border border-gray-200 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Pesquisar..."
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                  3
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        <LaboratorySidebar />
        <main className="flex-1 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}