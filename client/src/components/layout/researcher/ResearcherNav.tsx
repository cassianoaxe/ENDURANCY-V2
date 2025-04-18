import React from "react";

export function ResearcherNav() {
  return (
    <nav className="grid gap-1 px-2">
      <a 
        href="/researcher/dashboard" 
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100"
      >
        Dashboard
      </a>
      <a 
        href="/researcher/catalogo" 
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100"
      >
        Catálogo
      </a>
      <a 
        href="/researcher/pacientes" 
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100"
      >
        Pacientes
      </a>
      <a 
        href="/researcher/doencas" 
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100"
      >
        Doenças
      </a>
      <a 
        href="/researcher/laboratorio" 
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100"
      >
        Laboratório
      </a>
      <a 
        href="/researcher/estudos" 
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100"
      >
        Estudos
      </a>
      <a 
        href="/researcher/protocolos" 
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100"
      >
        Protocolos
      </a>
      <a 
        href="/researcher/colaboracoes" 
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100"
      >
        Colaborações
      </a>
      <a 
        href="/researcher/estatisticas" 
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100"
      >
        Estatísticas
      </a>
      <a 
        href="/researcher/grupos" 
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100"
      >
        Grupos de Pesquisa
      </a>
    </nav>
  );
}