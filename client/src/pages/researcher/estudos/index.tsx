import React from 'react';

// Versão super simplificada para evitar crashes
export default function EstudosPesquisa() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Estudos e Pesquisas</h1>
      <p>Gerencie seus estudos e protocolos de pesquisa.</p>
      
      <div className="mt-6 border p-4 rounded">
        <h2 className="font-bold mb-2">Estudos Ativos</h2>
        <ul className="list-disc pl-5">
          <li>Eficácia do CBD em Epilepsia Refratária</li>
          <li>Canabinoides e Qualidade do Sono</li>
          <li>Canabinoides no Tratamento da Ansiedade</li>
          <li>Modelo Animal para Epilepsia e CBD</li>
        </ul>
      </div>
      
      <div className="mt-6 border p-4 rounded">
        <h2 className="font-bold mb-2">Estudos Concluídos</h2>
        <ul className="list-disc pl-5">
          <li>Uso de THC/CBD em Dor Crônica</li>
        </ul>
      </div>
      
      <div className="mt-6">
        <h2 className="font-bold mb-4">Navegação Rápida</h2>
        <ul className="space-y-2">
          <li><a href="/researcher/dashboard" className="text-blue-500 hover:underline">Voltar ao Dashboard</a></li>
          <li><a href="/researcher/protocolos" className="text-blue-500 hover:underline">Protocolos</a></li>
          <li><a href="/researcher/colaboracoes" className="text-blue-500 hover:underline">Colaborações</a></li>
        </ul>
      </div>
    </div>
  );
}