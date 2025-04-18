import React from 'react';

// Versão super simplificada para evitar crashes
export default function ProtocolosPesquisa() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Protocolos de Pesquisa</h1>
      <p>Gerencie os protocolos de pesquisa padronizados.</p>
      
      <div className="mt-6 border p-4 rounded">
        <h2 className="font-bold mb-2">Protocolos Aprovados</h2>
        <ul className="list-disc pl-5">
          <li>Protocolo de Avaliação de Eficácia em Epilepsia</li>
          <li>Protocolo de Análise de Canabinoides por HPLC</li>
          <li>Protocolo de Avaliação de Efeitos Adversos</li>
        </ul>
      </div>
      
      <div className="mt-6 border p-4 rounded">
        <h2 className="font-bold mb-2">Protocolos em Revisão</h2>
        <ul className="list-disc pl-5">
          <li>Protocolo de Estudo Duplo-Cego para Dor Crônica</li>
          <li>Protocolo de Análise de Terpenos</li>
        </ul>
      </div>
      
      <div className="mt-6">
        <h2 className="font-bold mb-4">Navegação Rápida</h2>
        <ul className="space-y-2">
          <li><a href="/researcher/dashboard" className="text-blue-500 hover:underline">Voltar ao Dashboard</a></li>
          <li><a href="/researcher/estudos" className="text-blue-500 hover:underline">Estudos</a></li>
          <li><a href="/researcher/colaboracoes" className="text-blue-500 hover:underline">Colaborações</a></li>
        </ul>
      </div>
    </div>
  );
}