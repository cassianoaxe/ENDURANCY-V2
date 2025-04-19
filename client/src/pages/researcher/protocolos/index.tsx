import React from 'react';

// Versão extremamente ultra-leve para alta performance
export default function ProtocolosPesquisa() {
  // Componente simples sem estado, hooks ou lógica complexa
  return (
    <div className="p-4">
      <div className="max-w-[1200px] mx-auto bg-white p-6 rounded-lg shadow-sm border">
        {/* Cabeçalho simples */}
        <div className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold">Protocolos de Pesquisa</h1>
          <p className="text-gray-600">Gerencie os protocolos padronizados para suas pesquisas</p>
        </div>
        
        {/* Barra de pesquisa e filtros - sem funcionalidade real para maximizar performance */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-1 gap-2">
            <input 
              type="text" 
              placeholder="Buscar protocolos..." 
              className="px-3 py-2 border rounded flex-1" 
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Buscar</button>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Novo Protocolo</button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <select className="px-3 py-2 border rounded text-sm">
            <option>Todos os status</option>
            <option>Aprovado</option>
            <option>Em Revisão</option>
            <option>Rascunho</option>
          </select>
          
          <select className="px-3 py-2 border rounded text-sm">
            <option>Todos os tipos</option>
            <option>Clínico</option>
            <option>Laboratorial</option>
            <option>Administrativo</option>
          </select>
          
          <select className="px-3 py-2 border rounded text-sm">
            <option>Ordenar por: Mais recentes</option>
            <option>Ordenar por: Mais antigos</option>
            <option>Ordenar por: Título A-Z</option>
          </select>
        </div>
        
        {/* Protocolo 1 */}
        <div className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">Protocolo de Avaliação de Eficácia em Epilepsia</h3>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Aprovado</span>
          </div>
          <p className="text-gray-600 my-2">
            Protocolo padronizado para avaliação da eficácia de canabinoides em pacientes com epilepsia refratária, incluindo escalas de avaliação e métricas de acompanhamento.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
            <div>
              <span>Versão:</span>
              <strong> 2.3</strong>
            </div>
            <div>
              <span>Responsável:</span>
              <strong> Dra. Ana Ribeiro</strong>
            </div>
            <div>
              <span>Atualizado em:</span>
              <strong> 12/03/2025</strong>
            </div>
            <div>
              <span>Tipo:</span>
              <strong> Clínico</strong>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Visualizar</button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm">Baixar PDF</button>
          </div>
        </div>
        
        {/* Protocolo 2 */}
        <div className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">Protocolo de Análise de Canabinoides por HPLC</h3>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Aprovado</span>
          </div>
          <p className="text-gray-600 my-2">
            Procedimento padronizado para a análise quantitativa de canabinoides em amostras vegetais e extratos utilizando cromatografia líquida de alta eficiência (HPLC).
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
            <div>
              <span>Versão:</span>
              <strong> 1.8</strong>
            </div>
            <div>
              <span>Responsável:</span>
              <strong> Dr. Felipe Martins</strong>
            </div>
            <div>
              <span>Atualizado em:</span>
              <strong> 05/02/2025</strong>
            </div>
            <div>
              <span>Tipo:</span>
              <strong> Laboratorial</strong>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Visualizar</button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm">Baixar PDF</button>
          </div>
        </div>
        
        {/* Protocolo 3 */}
        <div className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">Protocolo de Avaliação de Efeitos Adversos</h3>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Aprovado</span>
          </div>
          <p className="text-gray-600 my-2">
            Procedimento para registro, classificação e manejo de efeitos adversos em estudos clínicos envolvendo canabinoides, seguindo normas da ANVISA e boas práticas clínicas.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
            <div>
              <span>Versão:</span>
              <strong> 3.0</strong>
            </div>
            <div>
              <span>Responsável:</span>
              <strong> Dra. Luciana Costa</strong>
            </div>
            <div>
              <span>Atualizado em:</span>
              <strong> 20/01/2025</strong>
            </div>
            <div>
              <span>Tipo:</span>
              <strong> Clínico</strong>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Visualizar</button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm">Baixar PDF</button>
          </div>
        </div>
        
        {/* Protocolo 4 */}
        <div className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">Protocolo de Estudo Duplo-Cego para Dor Crônica</h3>
            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">Em Revisão</span>
          </div>
          <p className="text-gray-600 my-2">
            Metodologia para estudos duplo-cego controlados por placebo avaliando eficácia de canabinoides em dor crônica, incluindo procedimentos de randomização e mascaramento.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
            <div>
              <span>Versão:</span>
              <strong> 1.2</strong>
            </div>
            <div>
              <span>Responsável:</span>
              <strong> Dr. Marcelo Souza</strong>
            </div>
            <div>
              <span>Atualizado em:</span>
              <strong> 15/03/2025</strong>
            </div>
            <div>
              <span>Tipo:</span>
              <strong> Clínico</strong>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Visualizar</button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm">Baixar PDF</button>
          </div>
        </div>
        
        {/* Navegação rápida */}
        <div className="mt-6 border-t pt-4">
          <div className="flex gap-2">
            <a href="/researcher/dashboard" className="text-blue-600 px-4 py-2 border border-blue-600 rounded hover:bg-blue-50">
              Voltar ao Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}