import React from 'react';

// Versão super simplificada para evitar crashes
export default function ResearcherDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard de Pesquisa Científica</h1>
      <p>Bem-vindo ao portal do pesquisador.</p>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border p-4 rounded">
          <h2 className="font-bold">Pesquisas Ativas</h2>
          <p className="text-2xl mt-2">12</p>
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="font-bold">Participantes</h2>
          <p className="text-2xl mt-2">248</p>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="font-bold mb-4">Menu de Navegação</h2>
        <ul className="space-y-2">
          <li><a href="/researcher/catalogo" className="text-blue-500 hover:underline">Catálogo de Pesquisas</a></li>
          <li><a href="/researcher/pacientes" className="text-blue-500 hover:underline">Banco de Pacientes</a></li>
          <li><a href="/researcher/doencas" className="text-blue-500 hover:underline">Doenças e Condições</a></li>
          <li><a href="/researcher/estudos" className="text-blue-500 hover:underline">Estudos</a></li>
          <li><a href="/researcher/protocolos" className="text-blue-500 hover:underline">Protocolos</a></li>
          <li><a href="/researcher/colaboracoes" className="text-blue-500 hover:underline">Colaborações</a></li>
        </ul>
      </div>
    </div>
  );
}