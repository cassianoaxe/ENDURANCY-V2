import React from 'react';

// Componente extremamente simples para testar carregamento
export default function PacientesSimples() {
  console.log('Renderizando PacientesSimples');
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Lista de Pacientes</h1>
      <p className="mt-4">Versão simplificada para teste</p>
    </div>
  );
}