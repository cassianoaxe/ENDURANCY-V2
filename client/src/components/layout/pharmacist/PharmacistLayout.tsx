import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import PharmacistSidebar from "./PharmacistSidebar";
import PharmacistHeader from "./PharmacistHeader";

export default function PharmacistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  // Verificação de autenticação e permissão
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "pharmacist")) {
      console.log("Acesso não autorizado ao portal do farmacêutico. Redirecionando...");
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  // Enquanto verifica autenticação, mostra tela de carregamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent align-[-0.125em]"></div>
          <p className="mt-4 text-gray-600">Carregando portal do farmacêutico...</p>
        </div>
      </div>
    );
  }

  // Se não tem permissão, não renderiza nada (vai ser redirecionado pelo useEffect)
  if (!user || user.role !== "pharmacist") {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <PharmacistSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <PharmacistHeader />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}