import React from 'react';

// Versão extremamente ultra-leve para alta performance
export default function EstudosPesquisa() {
  // Componente simples sem estado, hooks ou lógica complexa
  return (
    <div className="p-4">
      <div className="max-w-[1200px] mx-auto bg-white p-6 rounded-lg shadow-sm border">
        {/* Cabeçalho simples */}
        <div className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold">Estudos e Pesquisas</h1>
          <p className="text-gray-600">Gerenciamento de seus estudos e protocolos de pesquisa</p>
        </div>
        
        {/* Barra de pesquisa e filtros - sem funcionalidade real para maximizar performance */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-1 gap-2">
            <input 
              type="text" 
              placeholder="Buscar estudos..." 
              className="px-3 py-2 border rounded flex-1" 
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Buscar</button>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Novo Estudo</button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <select className="px-3 py-2 border rounded text-sm">
            <option>Todos os status</option>
            <option>Ativo</option>
            <option>Concluído</option>
            <option>Planejado</option>
            <option>Cancelado</option>
          </select>
          
          <select className="px-3 py-2 border rounded text-sm">
            <option>Todos os tipos</option>
            <option>Clínico</option>
            <option>Pré-clínico</option>
            <option>Observacional</option>
          </select>
          
          <select className="px-3 py-2 border rounded text-sm">
            <option>Ordenar por: Mais recentes</option>
            <option>Ordenar por: Mais antigos</option>
            <option>Ordenar por: Título A-Z</option>
            <option>Ordenar por: Progresso</option>
          </select>
        </div>
        
        {/* Estudo 1 */}
        <div className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">Eficácia do CBD em Epilepsia Refratária</h3>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Ativo</span>
          </div>
          <p className="text-gray-600 my-2">
            Estudo clínico randomizado sobre os efeitos do canabidiol em pacientes com epilepsia refratária em tratamento convencional.
          </p>
          <div className="flex flex-wrap gap-2 my-3">
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">CBD</span>
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Epilepsia</span>
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Clínico</span>
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Neurologia</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
            <div>
              <span>Investigador:</span>
              <strong> Dra. Ana Ribeiro</strong>
            </div>
            <div>
              <span>Instituição:</span>
              <strong> USP</strong>
            </div>
            <div>
              <span>Início:</span>
              <strong> 15/01/2025</strong>
            </div>
            <div>
              <span>Participantes:</span>
              <strong> 120</strong>
            </div>
            <div>
              <span>Progresso:</span>
              <strong> 45%</strong>
            </div>
          </div>
        </div>
        
        {/* Estudo 2 */}
        <div className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">Canabinoides e Qualidade do Sono</h3>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Ativo</span>
          </div>
          <p className="text-gray-600 my-2">
            Avaliação dos efeitos de diferentes formulações de canabinoides na qualidade do sono em pacientes com insônia crônica.
          </p>
          <div className="flex flex-wrap gap-2 my-3">
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Canabinoides</span>
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Sono</span>
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Clínico</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
            <div>
              <span>Investigador:</span>
              <strong> Dr. Carlos Mendes</strong>
            </div>
            <div>
              <span>Instituição:</span>
              <strong> Instituto de Neurociências</strong>
            </div>
            <div>
              <span>Início:</span>
              <strong> 10/02/2025</strong>
            </div>
            <div>
              <span>Participantes:</span>
              <strong> 85</strong>
            </div>
            <div>
              <span>Progresso:</span>
              <strong> 30%</strong>
            </div>
          </div>
        </div>
        
        {/* Estudo 3 */}
        <div className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">Uso de THC/CBD em Dor Crônica</h3>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Concluído</span>
          </div>
          <p className="text-gray-600 my-2">
            Estudo sobre a eficácia de formulação de THC/CBD em pacientes com dor crônica neuropática de diversas etiologias.
          </p>
          <div className="flex flex-wrap gap-2 my-3">
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">THC</span>
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">CBD</span>
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Dor</span>
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Clínico</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
            <div>
              <span>Investigador:</span>
              <strong> Dra. Luciana Costa</strong>
            </div>
            <div>
              <span>Instituição:</span>
              <strong> Hospital Albert Einstein</strong>
            </div>
            <div>
              <span>Período:</span>
              <strong> 20/04/2024 - 10/03/2025</strong>
            </div>
            <div>
              <span>Participantes:</span>
              <strong> 145</strong>
            </div>
            <div>
              <span>Progresso:</span>
              <strong> 100%</strong>
            </div>
          </div>
        </div>
        
        {/* Navegação rápida - no componente */}
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