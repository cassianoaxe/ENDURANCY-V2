import React, { ReactNode, useState, useEffect } from 'react';
import { Building, FileText, Award, Users, BarChart, Home } from 'lucide-react';
import axios from 'axios';

interface OrganizacaoInfo {
  id: number;
  name: string;
  type: string;
  cnpj: string;
  website: string | null;
  address: string | null;
}

interface PublicTransparenciaLayoutProps {
  children: ReactNode;
  organizacaoId: string;
  activeTab: string;
}

const PublicTransparenciaLayout: React.FC<PublicTransparenciaLayoutProps> = ({ 
  children, 
  organizacaoId,
  activeTab
}) => {
  const [organizacao, setOrganizacao] = useState<OrganizacaoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrganizacaoInfo = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/public/transparencia/organizacao/${organizacaoId}`);
        setOrganizacao(response.data);
        setError('');
      } catch (err: any) {
        console.error('Erro ao buscar informações da organização:', err);
        setError(err.response?.data?.message || 'Erro ao carregar informações da organização');
      } finally {
        setLoading(false);
      }
    };

    if (organizacaoId) {
      fetchOrganizacaoInfo();
    }
  }, [organizacaoId]);

  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return '';
    // Remove caracteres não numéricos
    const numbers = cnpj.replace(/\D/g, '');
    // Formata como CNPJ: XX.XXX.XXX/XXXX-XX
    return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const handleTabChange = (tabName: string) => {
    window.history.pushState({}, '', `/organization/transparencia/${organizacaoId}/${tabName}`);
    window.dispatchEvent(new Event('popstate'));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4 max-w-md">
          <h2 className="text-lg font-bold mb-2">Portal não disponível</h2>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => window.history.back()} 
          className="text-green-600 hover:text-green-800 font-medium"
        >
          Voltar
        </button>
      </div>
    );
  }

  if (!organizacao) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-amber-100 text-amber-800 p-4 rounded-md mb-4 max-w-md">
          <h2 className="text-lg font-bold mb-2">Organização não encontrada</h2>
          <p>Não conseguimos encontrar informações sobre esta organização.</p>
        </div>
        <button 
          onClick={() => window.history.back()} 
          className="text-green-600 hover:text-green-800 font-medium"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto py-4 px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{organizacao.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                CNPJ: {formatCNPJ(organizacao.cnpj)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href="#" 
                onClick={() => window.history.back()}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <Home className="w-4 h-4 mr-1" />
                Voltar
              </a>
              
              {organizacao.website && (
                <a 
                  href={organizacao.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-800"
                >
                  <Building className="w-4 h-4 mr-1" />
                  Visitar site oficial
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            <button 
              onClick={() => handleTabChange('sobre')}
              className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap border-b-2 ${
                activeTab === 'sobre' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <Building className="w-4 h-4 mr-2" />
              Sobre a Associação
            </button>
            <button 
              onClick={() => handleTabChange('documentos')}
              className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap border-b-2 ${
                activeTab === 'documentos' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Documentos
            </button>
            <button 
              onClick={() => handleTabChange('certificacoes')}
              className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap border-b-2 ${
                activeTab === 'certificacoes' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <Award className="w-4 h-4 mr-2" />
              Certificações
            </button>
            <button 
              onClick={() => handleTabChange('membros')}
              className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap border-b-2 ${
                activeTab === 'membros' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Membros
            </button>
            <button 
              onClick={() => handleTabChange('financeiro')}
              className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap border-b-2 ${
                activeTab === 'financeiro' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <BarChart className="w-4 h-4 mr-2" />
              Relatórios Financeiros
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto py-6 px-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>
            Portal de Transparência | {organizacao.name} | {new Date().getFullYear()}
          </p>
          <p className="mt-1">
            Este portal atende às exigências legais de transparência para organizações de interesse público.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicTransparenciaLayout;