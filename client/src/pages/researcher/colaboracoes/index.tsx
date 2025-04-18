import React from 'react';

// Versão super simplificada para evitar crashes
export default function ColaboracoesPesquisa() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Colaborações de Pesquisa</h1>
      <p>Gerenciamento de colaborações com instituições e outros pesquisadores.</p>
      
      <div className="mt-6 border p-4 rounded">
        <h2 className="font-bold mb-2">Colaborações Ativas</h2>
        <ul className="list-disc pl-5">
          <li>USP - Faculdade de Medicina</li>
          <li>UNIFESP - Departamento de Psiquiatria</li>
          <li>Instituto do Cérebro - UFRN</li>
          <li>Hospital Albert Einstein - São Paulo</li>
        </ul>
      </div>
      
      <div className="mt-6 border p-4 rounded">
        <h2 className="font-bold mb-2">Convites Pendentes</h2>
        <ul className="list-disc pl-5">
          <li>UFRJ - Laboratório de Neurociências</li>
          <li>Unicamp - Departamento de Farmacologia</li>
        </ul>
      </div>
      
      <div className="mt-6">
        <h2 className="font-bold mb-4">Navegação Rápida</h2>
        <ul className="space-y-2">
          <li><a href="/researcher/dashboard" className="text-blue-500 hover:underline">Voltar ao Dashboard</a></li>
          <li><a href="/researcher/estudos" className="text-blue-500 hover:underline">Estudos</a></li>
          <li><a href="/researcher/protocolos" className="text-blue-500 hover:underline">Protocolos</a></li>
        </ul>
      </div>
    </div>
  );
}