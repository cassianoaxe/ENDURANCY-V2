import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import OrganizationSidebar from "./OrganizationSidebar";
import Header from "./Header";
import { ThemeProvider } from "@/contexts/ThemeContext";
import CopilotProvider from "./CopilotProvider";


interface OrganizationLayoutProps {
  children: React.ReactNode;
}

export default function OrganizationLayout({ children }: OrganizationLayoutProps) {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'org_admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
        <p className="text-gray-500 mb-4">
          Você não tem permissão para acessar esta área. Este painel é apenas para administradores de organizações.
        </p>
        <a 
          href="/"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Voltar para a página inicial
        </a>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <CopilotProvider>
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
          <OrganizationSidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-6 pt-4 overflow-auto mt-16">
              {children}
            </main>
          </div>
        </div>
      </CopilotProvider>
    </ThemeProvider>
  );
}