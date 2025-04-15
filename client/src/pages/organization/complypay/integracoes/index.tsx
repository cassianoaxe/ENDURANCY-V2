"use client";
import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Componente de redirecionamento
 * 
 * Este componente redireciona qualquer tentativa de acesso à 
 * /organization/complypay/integracoes para a página centralizada
 * de integrações em /organization/integracoes
 */
export default function ComplyPayIntegracoesRedirect() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Redirecionamento para a página centralizada de integrações
    setLocation("/organization/integracoes");
  }, [setLocation]);
  
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Redirecionando para Integrações...</p>
    </div>
  );
}