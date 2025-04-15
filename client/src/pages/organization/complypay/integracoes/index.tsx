import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

/**
 * Componente de redirecionamento para unificar páginas de integração.
 * Este componente redireciona automaticamente o usuário para o caminho centralizado
 * de integrações em /organization/integracoes
 */
export default function ComplyPayIntegracoes() {
  const [, navigate] = useLocation();
  
  // Efeito para redirecionar para a página unificada de integrações
  useEffect(() => {
    // Redirecionar para a nova página unificada de integrações
    navigate('/organization/integracoes');
  }, [navigate]);

  // Mostrar indicador de carregamento durante o redirecionamento
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Redirecionando para a página de integrações...</p>
      </div>
    </div>
  );
}