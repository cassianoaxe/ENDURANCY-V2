import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import PublicTransparenciaLayout from '@/components/transparencia/PublicTransparenciaLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Book, Award, Users, BarChart } from 'lucide-react';
import DocumentoCard from '@/components/transparencia/DocumentoCard';
import CertificacaoCard from '@/components/transparencia/CertificacaoCard';
import MembroCard from '@/components/transparencia/MembroCard';
import RelatorioFinanceiroCard from '@/components/transparencia/RelatorioFinanceiroCard';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

// Sobre a Associação
const SobreAssociacao = ({ organizacaoId }: { organizacaoId: string }) => {
  // Buscar dados da organização - Usando a API-test que está funcionando
  const { data: organizacao, isLoading, error } = useQuery({
    queryKey: ['/api-test/transparencia/organizacao', organizacaoId],
    queryFn: async () => {
      const url = `/api-test/transparencia/organizacao/${organizacaoId}`;
      
      console.log('Fazendo requisição para API-TEST (organização):', url);
      const response = await axios.get(url);
      console.log('Resposta da API-TEST (organização):', response.data);
      
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !organizacao) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-red-800">Erro ao carregar informações</h3>
        <p className="text-red-700 mt-1">Não foi possível carregar as informações da associação.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Sobre {organizacao.name}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Informações Básicas</h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-500">Nome:</span>
              <p className="text-gray-800">{organizacao.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">CNPJ:</span>
              <p className="text-gray-800">{organizacao.cnpj}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Tipo:</span>
              <p className="text-gray-800">{organizacao.type === 'associacao' ? 'Associação' : organizacao.type}</p>
            </div>
            {organizacao.website && (
              <div>
                <span className="text-sm font-medium text-gray-500">Website:</span>
                <p className="text-gray-800">
                  <a 
                    href={organizacao.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline"
                  >
                    {organizacao.website}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
        
        {organizacao.address && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Endereço</h3>
            <p className="text-gray-700 whitespace-pre-line">{organizacao.address}</p>
          </div>
        )}
        
        <div className="bg-green-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Portal de Transparência</h3>
          <p className="text-gray-700">
            Este portal atende às exigências legais de transparência e visa proporcionar acesso a todas as informações relevantes sobre a associação, seus membros, documentos e relatórios financeiros.
          </p>
        </div>
      </div>
      
      <div className="prose max-w-none">
        <h3>Missão e Valores</h3>
        <p>
          Como associação voltada para o acesso e pesquisa com Cannabis medicinal, temos o compromisso de atuar com transparência, ética e responsabilidade, promovendo o bem-estar dos pacientes e contribuindo para o avanço da ciência e da medicina.
        </p>
        
        <h3>Transparência e Prestação de Contas</h3>
        <p>
          A transparência é um valor fundamental para nossa associação. Por meio deste portal, disponibilizamos documentos institucionais, relatórios financeiros, informações sobre nossa equipe e certificações, permitindo que qualquer cidadão possa acompanhar nossas atividades e a utilização dos recursos.
        </p>
        
        <h3>Navegue pelo Portal</h3>
        <p>
          Utilize as abas acima para acessar diferentes seções do Portal de Transparência:
        </p>
        <ul>
          <li><strong>Documentos:</strong> Estatuto, regulamentos, atas e outros documentos institucionais</li>
          <li><strong>Certificações:</strong> Reconhecimentos, títulos e certificações recebidas</li>
          <li><strong>Membros:</strong> Informações sobre diretoria, conselho e membros</li>
          <li><strong>Relatórios Financeiros:</strong> Prestação de contas, demonstrativos financeiros e balanços</li>
        </ul>
      </div>
    </div>
  );
};

// Documentos da Associação
const DocumentosTab = ({ organizacaoId }: { organizacaoId: string }) => {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todas');
  
  // Buscar documentos - Usando a API-test que está funcionando
  const { data: documentos, isLoading, error } = useQuery({
    queryKey: ['/api-test/transparencia/documentos', organizacaoId, categoriaSelecionada],
    queryFn: async () => {
      // Usando a rota de teste criada que funciona adequadamente
      const url = `/api-test/transparencia/documentos/${organizacaoId}`;
      
      console.log('Fazendo requisição para API-TEST (documentos):', url);
      const response = await axios.get(url);
      console.log('Resposta da API-TEST (documentos):', response.data);
      
      // Filtrar por categoria se necessário
      let result = Array.isArray(response.data) ? response.data : [];
      
      // Filtrar por categoria se não for 'todas'
      if (categoriaSelecionada !== 'todas') {
        result = result.filter((doc: any) => doc.categoria === categoriaSelecionada);
      }
      
      return result;
    }
  });

  const categorias = [
    { value: 'todas', label: 'Todos os Documentos' },
    { value: 'estatuto', label: 'Estatuto' },
    { value: 'ata_assembleia', label: 'Atas de Assembleia' },
    { value: 'regimento_interno', label: 'Regimento Interno' },
    { value: 'balanco_financeiro', label: 'Balanço Financeiro' },
    { value: 'relatorio_atividades', label: 'Relatório de Atividades' },
    { value: 'prestacao_contas', label: 'Prestação de Contas' },
    { value: 'certificacao', label: 'Certificações' },
    { value: 'declaracao_utilidade_publica', label: 'Declarações de Utilidade Pública' },
    { value: 'outros', label: 'Outros Documentos' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Documentos Institucionais</h2>
        
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
            {categorias.map((categoria) => (
              <button
                key={categoria.value}
                onClick={() => setCategoriaSelecionada(categoria.value)}
                className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${
                  categoriaSelecionada === categoria.value
                    ? 'bg-green-100 text-green-800'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {categoria.label}
              </button>
            ))}
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-red-800">Erro ao carregar documentos</h3>
            <p className="text-red-700 mt-1">Não foi possível carregar os documentos da associação.</p>
          </div>
        ) : documentos && documentos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentos.map((documento: any) => (
              <DocumentoCard key={documento.id} documento={documento} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-md text-center">
            <Book className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-800">Nenhum documento encontrado</h3>
            <p className="text-gray-600 mt-1">
              {categoriaSelecionada === 'todas'
                ? 'Não existem documentos publicados no momento.'
                : `Não existem documentos na categoria ${categorias.find(c => c.value === categoriaSelecionada)?.label.toLowerCase()}.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Certificações da Associação
const CertificacoesTab = ({ organizacaoId }: { organizacaoId: string }) => {
  const [tipoSelecionado, setTipoSelecionado] = useState('todos');
  
  // Buscar certificações - Usando a API-test que está funcionando
  const { data: certificacoes, isLoading, error } = useQuery({
    queryKey: ['/api-test/transparencia/certificacoes', organizacaoId, tipoSelecionado],
    queryFn: async () => {
      // Usando a rota de teste criada que funciona adequadamente
      const url = `/api-test/transparencia/certificacoes/${organizacaoId}`;
      
      console.log('Fazendo requisição para API-TEST (certificações):', url);
      const response = await axios.get(url);
      console.log('Resposta da API-TEST (certificações):', response.data);
      
      // Filtrar por tipo se necessário
      let result = Array.isArray(response.data) ? response.data : [];
      
      // Filtrar por tipo se não for 'todos'
      if (tipoSelecionado !== 'todos') {
        result = result.filter((cert: any) => cert.tipo === tipoSelecionado);
      }
      
      return result;
    }
  });

  const tipos = [
    { value: 'todos', label: 'Todas as Certificações' },
    { value: 'certificado_qualidade', label: 'Certificados de Qualidade' },
    { value: 'certificado_sustentabilidade', label: 'Certificados de Sustentabilidade' },
    { value: 'certificado_conformidade', label: 'Certificados de Conformidade' },
    { value: 'titulo_utilidade_publica', label: 'Títulos de Utilidade Pública' },
    { value: 'acreditacao', label: 'Acreditações' },
    { value: 'iso', label: 'Certificados ISO' },
    { value: 'premio', label: 'Prêmios' },
    { value: 'selo', label: 'Selos' },
    { value: 'outros', label: 'Outros' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Certificações e Reconhecimentos</h2>
        
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
            {tipos.map((tipo) => (
              <button
                key={tipo.value}
                onClick={() => setTipoSelecionado(tipo.value)}
                className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${
                  tipoSelecionado === tipo.value
                    ? 'bg-green-100 text-green-800'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tipo.label}
              </button>
            ))}
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-red-800">Erro ao carregar certificações</h3>
            <p className="text-red-700 mt-1">Não foi possível carregar as certificações da associação.</p>
          </div>
        ) : certificacoes && certificacoes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificacoes.map((certificacao: any) => (
              <CertificacaoCard key={certificacao.id} certificacao={certificacao} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-md text-center">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-800">Nenhuma certificação encontrada</h3>
            <p className="text-gray-600 mt-1">
              {tipoSelecionado === 'todos'
                ? 'Não existem certificações publicadas no momento.'
                : `Não existem certificações do tipo ${tipos.find(t => t.value === tipoSelecionado)?.label.toLowerCase()}.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Membros da Associação
const MembrosTab = ({ organizacaoId }: { organizacaoId: string }) => {
  const [tipoSelecionado, setTipoSelecionado] = useState('todos');
  
  // Buscar membros - Usando a API-test que está funcionando
  const { data: membros, isLoading, error } = useQuery({
    queryKey: ['/api-test/transparencia/membros', organizacaoId, tipoSelecionado],
    queryFn: async () => {
      // Usando a rota de teste criada que funciona adequadamente
      const url = `/api-test/transparencia/membros/${organizacaoId}`;
      
      console.log('Fazendo requisição para API-TEST (membros):', url);
      const response = await axios.get(url);
      console.log('Resposta da API-TEST (membros):', response.data);
      
      // Filtrar por tipo se necessário
      let result = Array.isArray(response.data) ? response.data : [];
      
      // Filtrar por tipo se não for 'todos'
      if (tipoSelecionado !== 'todos') {
        result = result.filter((membro: any) => membro.tipo === tipoSelecionado);
      }
      
      return result;
    }
  });

  const tipos = [
    { value: 'todos', label: 'Todos os Membros' },
    { value: 'diretoria', label: 'Diretoria' },
    { value: 'conselho_administrativo', label: 'Conselho Administrativo' },
    { value: 'conselho_fiscal', label: 'Conselho Fiscal' },
    { value: 'conselho_consultivo', label: 'Conselho Consultivo' },
    { value: 'associado_fundador', label: 'Associados Fundadores' },
    { value: 'associado_efetivo', label: 'Associados Efetivos' },
    { value: 'associado_honorario', label: 'Associados Honorários' },
    { value: 'colaborador', label: 'Colaboradores' },
    { value: 'voluntario', label: 'Voluntários' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Membros e Equipe</h2>
        
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
            {tipos.map((tipo) => (
              <button
                key={tipo.value}
                onClick={() => setTipoSelecionado(tipo.value)}
                className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${
                  tipoSelecionado === tipo.value
                    ? 'bg-green-100 text-green-800'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tipo.label}
              </button>
            ))}
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-red-800">Erro ao carregar membros</h3>
            <p className="text-red-700 mt-1">Não foi possível carregar a lista de membros da associação.</p>
          </div>
        ) : membros && membros.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {membros.map((membro: any) => (
              <MembroCard key={membro.id} membro={membro} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-md text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-800">Nenhum membro encontrado</h3>
            <p className="text-gray-600 mt-1">
              {tipoSelecionado === 'todos'
                ? 'Não existem membros publicados no momento.'
                : `Não existem membros na categoria ${tipos.find(t => t.value === tipoSelecionado)?.label.toLowerCase()}.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Relatórios Financeiros
const RelatoriosFinanceirosTab = ({ organizacaoId }: { organizacaoId: string }) => {
  const [anoSelecionado, setAnoSelecionado] = useState('todos');
  
  // Buscar relatórios financeiros - Usando a API-test que está funcionando
  const { data: relatorios, isLoading, error } = useQuery({
    queryKey: ['/api-test/transparencia/financeiro', organizacaoId, anoSelecionado],
    queryFn: async () => {
      // Usando a rota de teste criada que funciona adequadamente
      const url = `/api-test/transparencia/financeiro/${organizacaoId}`;
      
      console.log('Fazendo requisição para API-TEST (financeiro):', url);
      const response = await axios.get(url);
      console.log('Resposta da API-TEST (financeiro):', response.data);
      
      // Filtrar por ano se necessário
      let result = Array.isArray(response.data) ? response.data : [];
      
      // Filtrar por ano se não for 'todos'
      if (anoSelecionado !== 'todos') {
        result = result.filter((relatorio: any) => relatorio.ano?.toString() === anoSelecionado);
      }
      
      return result;
    }
  });

  // Obter lista de anos disponíveis a partir dos relatórios
  const anosDisponiveis = Array.isArray(relatorios) && relatorios.length > 0
    ? [...new Set(relatorios.map((r: any) => r.ano))].sort((a, b) => b - a)
    : [];

  const [relatorioDetalhes, setRelatorioDetalhes] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Relatórios Financeiros</h2>
        
        {relatorioDetalhes ? (
          <div>
            <button 
              onClick={() => setRelatorioDetalhes(null)}
              className="mb-4 inline-flex items-center text-sm font-medium text-green-600 hover:text-green-800"
            >
              ← Voltar para a lista de relatórios
            </button>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {relatorioDetalhes.mes 
                  ? `Relatório de ${relatorioDetalhes.mes}/${relatorioDetalhes.ano}` 
                  : `Relatório Anual ${relatorioDetalhes.ano}`
                }
              </h3>
              
              {relatorioDetalhes.titulo && (
                <p className="text-lg text-gray-700 mb-4">{relatorioDetalhes.titulo}</p>
              )}
              
              {relatorioDetalhes.descricao && (
                <div className="p-4 bg-gray-50 rounded-md mb-6">
                  <p className="text-gray-700">{relatorioDetalhes.descricao}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 p-4 rounded-md">
                  <h4 className="text-lg font-medium text-green-800 mb-3">Receitas</h4>
                  <p className="text-2xl font-bold text-green-700 mb-4">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(relatorioDetalhes.totalReceitas)}
                  </p>
                  
                  {relatorioDetalhes.receitasPorCategoria && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-500">Distribuição por categorias:</h5>
                      {Object.entries(relatorioDetalhes.receitasPorCategoria).map(([categoria, valor]: [string, any]) => (
                        <div key={categoria} className="flex justify-between text-sm">
                          <span className="text-gray-700">{categoria}</span>
                          <span className="font-medium text-green-700">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="bg-red-50 p-4 rounded-md">
                  <h4 className="text-lg font-medium text-red-800 mb-3">Despesas</h4>
                  <p className="text-2xl font-bold text-red-700 mb-4">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(relatorioDetalhes.totalDespesas)}
                  </p>
                  
                  {relatorioDetalhes.despesasPorCategoria && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-500">Distribuição por categorias:</h5>
                      {Object.entries(relatorioDetalhes.despesasPorCategoria).map(([categoria, valor]: [string, any]) => (
                        <div key={categoria} className="flex justify-between text-sm">
                          <span className="text-gray-700">{categoria}</span>
                          <span className="font-medium text-red-700">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className={`p-4 rounded-md mb-6 ${
                relatorioDetalhes.totalReceitas >= relatorioDetalhes.totalDespesas 
                  ? 'bg-green-100' 
                  : 'bg-red-100'
              }`}>
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium text-gray-800">Saldo</h4>
                  <p className={`text-xl font-bold ${
                    relatorioDetalhes.totalReceitas >= relatorioDetalhes.totalDespesas 
                      ? 'text-green-700' 
                      : 'text-red-700'
                  }`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      relatorioDetalhes.totalReceitas - relatorioDetalhes.totalDespesas
                    )}
                  </p>
                </div>
              </div>
              
              {/* Botão para download de PDF se disponível */}
              {relatorioDetalhes.arquivoUrl && (
                <div className="border-t border-gray-200 pt-4 mt-8">
                  <button 
                    onClick={() => window.open(relatorioDetalhes.arquivoUrl, '_blank')}
                    className="flex items-center text-green-600 hover:text-green-800 font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                    </svg>
                    Baixar relatório completo em PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div className="text-lg font-medium">Filtrar por ano:</div>
              <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setAnoSelecionado('todos')}
                  className={`px-3 py-2 text-sm font-medium ${
                    anoSelecionado === 'todos'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Todos
                </button>
                
                {anosDisponiveis.map(ano => (
                  <button
                    key={ano}
                    onClick={() => setAnoSelecionado(ano.toString())}
                    className={`px-3 py-2 text-sm font-medium ${
                      anoSelecionado === ano.toString()
                        ? 'bg-green-100 text-green-800'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {ano}
                  </button>
                ))}
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-red-800">Erro ao carregar relatórios financeiros</h3>
                <p className="text-red-700 mt-1">Não foi possível carregar os relatórios financeiros da associação.</p>
              </div>
            ) : relatorios && relatorios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatorios.map((relatorio: any) => (
                  <RelatorioFinanceiroCard 
                    key={relatorio.id} 
                    relatorio={relatorio} 
                    onClick={() => setRelatorioDetalhes(relatorio)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-md text-center">
                <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-800">Nenhum relatório financeiro encontrado</h3>
                <p className="text-gray-600 mt-1">
                  {anoSelecionado === 'todos'
                    ? 'Não existem relatórios financeiros publicados no momento.'
                    : `Não existem relatórios financeiros para o ano ${anoSelecionado}.`
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Página principal de transparência
const TransparenciaPublica = () => {
  const [location] = useLocation();
  const [tab, setTab] = useState('sobre');
  const [orgId, setOrgId] = useState<string | null>(null);
  
  useEffect(() => {
    // Analisar o URL para determinar a organização e a aba
    const match = location.match(/\/organization\/transparencia\/(\d+)(?:\/([a-z]+))?/);
    
    if (match) {
      setOrgId(match[1]);
      
      // Se a aba for especificada, use-a; caso contrário, mantenha a aba atual ou use "sobre" como padrão
      if (match[2]) {
        setTab(match[2]);
      } else {
        // Se não houver aba especificada, use "sobre" como padrão
        setTab('sobre');
      }
      console.log("URL de transparência reconhecido:", location, "ID da organização:", match[1], "Aba:", match[2] || 'sobre');
    } else {
      // URL não corresponde ao padrão esperado
      console.error("URL não reconhecido:", location);
    }
  }, [location]);
  
  if (!orgId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div className="bg-red-100 text-red-800 p-6 rounded-md max-w-md">
          <h2 className="text-xl font-bold mb-3">URL Inválida</h2>
          <p className="mb-4">
            O formato da URL não é válido. A URL correta deve ser no formato:
            <br />
            <code className="text-red-600 bg-red-50 px-1 rounded">
              /organization/transparencia/ID_ORGANIZACAO
            </code>
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <PublicTransparenciaLayout organizacaoId={orgId} activeTab={tab}>
      {tab === 'sobre' && <SobreAssociacao organizacaoId={orgId} />}
      {tab === 'documentos' && <DocumentosTab organizacaoId={orgId} />}
      {tab === 'certificacoes' && <CertificacoesTab organizacaoId={orgId} />}
      {tab === 'membros' && <MembrosTab organizacaoId={orgId} />}
      {tab === 'financeiro' && <RelatoriosFinanceirosTab organizacaoId={orgId} />}
    </PublicTransparenciaLayout>
  );
};

export default TransparenciaPublica;