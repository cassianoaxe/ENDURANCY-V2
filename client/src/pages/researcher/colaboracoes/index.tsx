import React from 'react';

// Versão extremamente ultra-leve para alta performance
export default function ColaboracoesPesquisa() {
  // Componente simples sem estado, hooks ou lógica complexa
  return (
    <div className="p-4">
      <div className="max-w-[1200px] mx-auto bg-white p-6 rounded-lg shadow-sm border">
        {/* Cabeçalho simples */}
        <div className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold">Colaborações de Pesquisa</h1>
          <p className="text-gray-600">Gerenciamento de parcerias com instituições e outros pesquisadores</p>
        </div>
        
        {/* Tabs simples - implementados apenas visualmente para garantir performance */}
        <div className="flex border-b mb-6">
          <div className="px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-medium">Colaborações Ativas</div>
          <div className="px-4 py-2 text-gray-500">Convites Pendentes</div>
          <div className="px-4 py-2 text-gray-500">Sugestões</div>
        </div>
        
        {/* Barra de pesquisa e filtros - sem funcionalidade */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-1 gap-2">
            <input 
              type="text" 
              placeholder="Buscar colaborações..." 
              className="px-3 py-2 border rounded flex-1" 
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Buscar</button>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Nova Colaboração</button>
        </div>
        
        {/* Colaboração 1 */}
        <div className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center font-semibold text-gray-600">USP</div>
              <h3 className="text-lg font-semibold">USP - Faculdade de Medicina</h3>
            </div>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Ativa</span>
          </div>
          <p className="text-gray-600 my-2 ml-16">
            Colaboração com a Faculdade de Medicina da Universidade de São Paulo para pesquisas clínicas sobre o uso de canabinoides em epilepsia refratária.
          </p>
          <div className="flex flex-wrap gap-2 ml-16 mb-3">
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Pesquisa Clínica</span>
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Epilepsia</span>
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Neurologia</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3 ml-16">
            <div>
              <span>Contato Principal:</span>
              <strong> Dra. Ana Ribeiro</strong>
            </div>
            <div>
              <span>Data de Início:</span>
              <strong> 12/01/2023</strong>
            </div>
            <div>
              <span>Projetos Ativos:</span>
              <strong> 3</strong>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Ver Detalhes</button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm">Enviar Mensagem</button>
          </div>
        </div>
        
        {/* Colaboração 2 */}
        <div className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center font-semibold text-gray-600">UNI</div>
              <h3 className="text-lg font-semibold">UNIFESP - Departamento de Psiquiatria</h3>
            </div>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Ativa</span>
          </div>
          <p className="text-gray-600 my-2 ml-16">
            Parceria para estudos sobre o uso de canabinoides no tratamento de transtornos de ansiedade e depressão, com ênfase em biomarcadores e neuroimagem.
          </p>
          <div className="flex flex-wrap gap-2 ml-16 mb-3">
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Psiquiatria</span>
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Ansiedade</span>
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Neuroimagem</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3 ml-16">
            <div>
              <span>Contato Principal:</span>
              <strong> Dr. Marcelo Souza</strong>
            </div>
            <div>
              <span>Data de Início:</span>
              <strong> 05/07/2024</strong>
            </div>
            <div>
              <span>Projetos Ativos:</span>
              <strong> 1</strong>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Ver Detalhes</button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm">Enviar Mensagem</button>
          </div>
        </div>
        
        {/* Colaboração 3 */}
        <div className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center font-semibold text-gray-600">ICE</div>
              <h3 className="text-lg font-semibold">Instituto do Cérebro - UFRN</h3>
            </div>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Ativa</span>
          </div>
          <p className="text-gray-600 my-2 ml-16">
            Parceria para estudos sobre mecanismos de ação de canabinoides no sistema nervoso central, utilizando modelos animais e técnicas avançadas de eletrofisiologia.
          </p>
          <div className="flex flex-wrap gap-2 ml-16 mb-3">
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Neurociência</span>
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Eletrofisiologia</span>
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Modelos Animais</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3 ml-16">
            <div>
              <span>Contato Principal:</span>
              <strong> Dr. Ricardo Almeida</strong>
            </div>
            <div>
              <span>Data de Início:</span>
              <strong> 18/09/2024</strong>
            </div>
            <div>
              <span>Projetos Ativos:</span>
              <strong> 2</strong>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Ver Detalhes</button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm">Enviar Mensagem</button>
          </div>
        </div>
        
        {/* Seção de convites pendentes */}
        <h3 className="text-lg font-semibold mt-8 mb-4 border-b pb-2">Convites Pendentes</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-2 items-center">
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center font-semibold text-gray-600">UFRJ</div>
                <h3 className="font-medium">UFRJ - Laboratório de Neurociências</h3>
              </div>
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">Pendente</span>
            </div>
            <p className="text-sm text-gray-600 my-2">
              Convite para colaboração em estudos sobre efeitos neuroprotetores de canabinoides em modelos celulares de neurodegeneração.
            </p>
            <div className="flex justify-end gap-2 mt-3">
              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Aceitar</button>
              <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm">Recusar</button>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-2 items-center">
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center font-semibold text-gray-600">UNI</div>
                <h3 className="font-medium">Unicamp - Departamento de Farmacologia</h3>
              </div>
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">Pendente</span>
            </div>
            <p className="text-sm text-gray-600 my-2">
              Convite para parceria em pesquisas sobre farmacologia de terpenos da cannabis e seu potencial terapêutico em doenças inflamatórias.
            </p>
            <div className="flex justify-end gap-2 mt-3">
              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Aceitar</button>
              <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm">Recusar</button>
            </div>
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