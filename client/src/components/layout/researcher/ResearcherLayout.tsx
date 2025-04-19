import { ReactNode } from "react";
import { useLocation } from 'wouter';
import { useAuth } from "@/contexts/AuthContext";

// Versão ultra-simplificada sem componentes pesados para garantir máxima performance
interface ResearcherLayoutProps {
  children: ReactNode;
}

export default function ResearcherLayout({ children }: ResearcherLayoutProps) {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const firstName = user?.name?.split(' ')[0] || 'Pesquisador';
  const userInitials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('')
    : 'PR';
  
  // Função de logout simplificada
  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/login');
      console.log("Logout completo no frontend");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      alert("Não foi possível finalizar sua sessão. Tente novamente.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar fixa simplificada */}
      <div className="hidden lg:block w-64 flex-shrink-0 border-r bg-white">
        <div className="flex h-full flex-col">
          {/* Cabeçalho da sidebar */}
          <div className="px-4 py-6 border-b">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold">
                P
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Portal do Pesquisador</h2>
                <p className="text-xs text-gray-500">Endurancy Research</p>
              </div>
            </div>
          </div>
          
          {/* Menu simplificado */}
          <div className="p-4 overflow-auto">
            <nav>
              <ul className="space-y-2">
                <li>
                  <a href="/researcher/dashboard" className="block px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="/researcher/catalogo" className="block px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                    Catálogo de Pesquisas
                  </a>
                </li>
                <li>
                  <a href="/researcher/pacientes" className="block px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                    Banco de Pacientes
                  </a>
                </li>
                <li>
                  <a href="/researcher/doencas" className="block px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                    Doenças e Condições
                  </a>
                </li>
                <li>
                  <a href="/researcher/estudos" className="block px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                    Estudos
                  </a>
                </li>
                <li>
                  <a href="/researcher/protocolos" className="block px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                    Protocolos
                  </a>
                </li>
                <li>
                  <a href="/researcher/colaboracoes" className="block px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                    Colaborações
                  </a>
                </li>
                <li>
                  <a href="/researcher/estatisticas" className="block px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                    Estatísticas
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          
          {/* Perfil do usuário simplificado */}
          <div className="mt-auto p-4 border-t">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                {userInitials}
              </div>
              <div className="flex-1 truncate">
                <div className="text-sm font-medium text-gray-700">
                  {firstName}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user?.email || user?.username}
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-auto">
        {/* Header simplificado */}
        <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-white px-4">
          <button
            className="lg:hidden h-10 w-10 flex items-center justify-center text-gray-500"
            onClick={() => alert("Menu mobile: use versão desktop para melhor experiência")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <div className="flex-1" />
          <div className="lg:hidden flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              {userInitials}
            </div>
            <button 
              onClick={handleLogout}
              className="h-8 w-8 flex items-center justify-center text-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </header>
        
        {/* Conteúdo principal */}
        <div className="h-[calc(100vh-4rem)]">{children}</div>
      </main>
    </div>
  );
}