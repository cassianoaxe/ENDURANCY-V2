import React from 'react';

// Versão extremamente ultra-leve para alta performance
export default function PacientesPesquisa() {
  // Componente simples sem estado, hooks ou lógica complexa
  return (
    <div className="p-4">
      <div className="max-w-[1200px] mx-auto bg-white p-6 rounded-lg shadow-sm border">
        {/* Cabeçalho simples */}
        <div className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold">Banco de Pacientes para Pesquisa</h1>
          <p className="text-gray-600">Gerenciamento de voluntários para estudos clínicos</p>
        </div>
        
        {/* Barra de pesquisa e filtros - sem funcionalidade real para maximizar performance */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-1 gap-2">
            <input 
              type="text" 
              placeholder="Buscar pacientes..." 
              className="px-3 py-2 border rounded flex-1" 
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Buscar</button>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Adicionar Paciente</button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <select className="px-3 py-2 border rounded text-sm">
            <option>Todos os Status</option>
            <option>Ativo</option>
            <option>Inativo</option>
            <option>Pendente</option>
          </select>
          
          <select className="px-3 py-2 border rounded text-sm">
            <option>Todas as Condições</option>
            <option>Epilepsia</option>
            <option>Ansiedade</option>
            <option>Dor Crônica</option>
            <option>Insônia</option>
          </select>
          
          <select className="px-3 py-2 border rounded text-sm">
            <option>Ordenar por: Nome</option>
            <option>Ordenar por: Idade</option>
            <option>Ordenar por: Condição</option>
            <option>Ordenar por: Último Contato</option>
          </select>
        </div>
        
        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm text-gray-600">Total de Pacientes</h3>
            <p className="text-2xl font-semibold">248</p>
            <small className="text-gray-500">+12 novos este mês</small>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm text-gray-600">Participando de Estudos</h3>
            <p className="text-2xl font-semibold">132</p>
            <small className="text-gray-500">53% do total</small>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm text-gray-600">Aguardando Contato</h3>
            <p className="text-2xl font-semibold">28</p>
            <small className="text-gray-500">11% do total</small>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm text-gray-600">Estudos Ativos</h3>
            <p className="text-2xl font-semibold">8</p>
            <small className="text-gray-500">Recrutando pacientes</small>
          </div>
        </div>
        
        {/* Tabela de pacientes simples */}
        <div className="border rounded-lg overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Idade</th>
                <th className="px-4 py-3 text-left">Condição Principal</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Último Contato</th>
                <th className="px-4 py-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-3">Ana Maria Silva</td>
                <td className="px-4 py-3">42</td>
                <td className="px-4 py-3">Epilepsia Refratária</td>
                <td className="px-4 py-3">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Ativo</span>
                </td>
                <td className="px-4 py-3">12/04/2025</td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:text-blue-800 mr-2">Ver</button>
                  <button className="text-blue-600 hover:text-blue-800">Editar</button>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">Carlos Eduardo Santos</td>
                <td className="px-4 py-3">35</td>
                <td className="px-4 py-3">Dor Crônica</td>
                <td className="px-4 py-3">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Ativo</span>
                </td>
                <td className="px-4 py-3">10/04/2025</td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:text-blue-800 mr-2">Ver</button>
                  <button className="text-blue-600 hover:text-blue-800">Editar</button>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">Juliana Mendes</td>
                <td className="px-4 py-3">28</td>
                <td className="px-4 py-3">Ansiedade</td>
                <td className="px-4 py-3">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Ativo</span>
                </td>
                <td className="px-4 py-3">08/04/2025</td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:text-blue-800 mr-2">Ver</button>
                  <button className="text-blue-600 hover:text-blue-800">Editar</button>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">Roberto Almeida</td>
                <td className="px-4 py-3">51</td>
                <td className="px-4 py-3">Parkinson</td>
                <td className="px-4 py-3">
                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">Pendente</span>
                </td>
                <td className="px-4 py-3">05/04/2025</td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:text-blue-800 mr-2">Ver</button>
                  <button className="text-blue-600 hover:text-blue-800">Editar</button>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">Fernanda Costa</td>
                <td className="px-4 py-3">39</td>
                <td className="px-4 py-3">Insônia</td>
                <td className="px-4 py-3">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Ativo</span>
                </td>
                <td className="px-4 py-3">02/04/2025</td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:text-blue-800 mr-2">Ver</button>
                  <button className="text-blue-600 hover:text-blue-800">Editar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Paginação simples */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Mostrando 5 de 248 pacientes
          </div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border rounded hover:bg-gray-50">Anterior</button>
            <button className="px-3 py-1 border rounded bg-blue-600 text-white">1</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-50">3</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-50">Próxima</button>
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