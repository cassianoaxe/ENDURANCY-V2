import React from 'react';

// Versão extremamente ultra-leve para alta performance
export default function ResearcherDashboard() {
  // Componente simples sem nenhum estado, hooks ou lógica complexa
  return (
    <div className="p-4">
      <div className="max-w-[1200px] mx-auto bg-white p-6 rounded-lg shadow-sm border">
        {/* Cabeçalho simples sem componentes complexos */}
        <div className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold">Dashboard de Pesquisa Científica</h1>
          <p className="text-gray-600">Acompanhe e gerencie todas as atividades de pesquisa</p>
        </div>
        
        {/* Estatísticas em layout simples */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm text-gray-600">Pesquisas Ativas</h3>
            <p className="text-2xl font-semibold">12</p>
            <small className="text-gray-500">+2 novas este mês</small>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm text-gray-600">Participantes</h3>
            <p className="text-2xl font-semibold">248</p>
            <small className="text-gray-500">Em 8 estudos diferentes</small>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm text-gray-600">Publicações</h3>
            <p className="text-2xl font-semibold">18</p>
            <small className="text-gray-500">3 em processo de revisão</small>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm text-gray-600">Colaborações</h3>
            <p className="text-2xl font-semibold">5</p>
            <small className="text-gray-500">Com 3 instituições diferentes</small>
          </div>
        </div>
        
        {/* Grid simple com links de navegação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border p-4 rounded-lg">
            <h3 className="font-medium border-b pb-2 mb-2">Acesso Rápido</h3>
            <ul className="space-y-2">
              <li><a href="/researcher/catalogo" className="text-blue-600 hover:underline block py-1">Catálogo de Pesquisas</a></li>
              <li><a href="/researcher/pacientes" className="text-blue-600 hover:underline block py-1">Banco de Pacientes</a></li>
              <li><a href="/researcher/doencas" className="text-blue-600 hover:underline block py-1">Doenças e Condições</a></li>
              <li><a href="/researcher/estatisticas" className="text-blue-600 hover:underline block py-1">Estatísticas</a></li>
              <li><a href="/researcher/estudos" className="text-blue-600 hover:underline block py-1">Estudos</a></li>
            </ul>
          </div>
          
          <div className="border p-4 rounded-lg">
            <h3 className="font-medium border-b pb-2 mb-2">Pesquisas Recentes</h3>
            <ul className="space-y-3">
              <li className="border-b pb-2">
                <div>Eficácia do CBD em Epilepsia Refratária</div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Em Andamento</span>
                  <small className="text-gray-500">Atualizado Hoje</small>
                </div>
              </li>
              <li className="border-b pb-2">
                <div>Canabinoides e Qualidade do Sono</div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Em Análise</span>
                  <small className="text-gray-500">Atualizado Ontem</small>
                </div>
              </li>
              <li>
                <div>Uso de THC/CBD em Dor Crônica</div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Concluído</span>
                  <small className="text-gray-500">Atualizado 2 dias atrás</small>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Próximos eventos em layout simples */}
        <div className="border p-4 rounded-lg mt-6">
          <h3 className="font-medium border-b pb-2 mb-2">Próximos Eventos</h3>
          <ul className="space-y-2">
            <li className="flex justify-between py-2 border-b">
              <div>Reunião do Comitê de Ética</div>
              <div>25/04/2025</div>
            </li>
            <li className="flex justify-between py-2 border-b">
              <div>Apresentação de Resultados Preliminares</div>
              <div>30/04/2025</div>
            </li>
            <li className="flex justify-between py-2">
              <div>Workshop de Metodologia</div>
              <div>05/05/2025</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}