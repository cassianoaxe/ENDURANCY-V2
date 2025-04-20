"use client";
import React from "react";
import { Leaf } from "lucide-react";

interface EcosystemNodeProps {
  label: string;
  className?: string;
  position: string;
}

const EcosystemNode: React.FC<EcosystemNodeProps> = ({ label, className, position }) => {
  return (
    <div 
      className={`absolute ${position} flex items-center justify-center bg-primary text-white rounded-full px-6 py-3 font-medium shadow-md hover:bg-primary/90 transition-colors ${className}`}
    >
      {label}
    </div>
  );
};

export function EcosystemGraph() {
  // Cores correspondentes ao tema Endurancy e primary na theme.json
  const primaryColor = "hsl(222.2 47.4% 11.2%)";
  
  return (
    <div className="relative w-full h-[600px] mx-auto my-8">
      {/* Círculo central com logo */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center bg-white rounded-full h-36 w-36 shadow-lg z-10 border-4 border-primary/10">
        <div className="bg-primary/5 p-4 rounded-full flex items-center justify-center">
          <Leaf className="h-10 w-10 text-green-600" />
        </div>
        <div className="text-center font-bold text-lg mt-2 text-primary">Endurancy</div>
        <div className="text-center text-xs text-muted-foreground mt-1">Ecossistema completo</div>
      </div>
      
      {/* Nós do ecossistema */}
      <EcosystemNode label="Paciente" position="top-10 left-1/2 transform -translate-x-1/2" />
      <EcosystemNode label="Médico" position="top-1/4 right-10" />
      <EcosystemNode label="Químico" position="top-1/2 right-5" />
      <EcosystemNode label="Financeiro" position="bottom-1/3 right-10" />
      <EcosystemNode label="Empresário" position="bottom-10 left-1/2 transform -translate-x-1/2" />
      <EcosystemNode label="Auditor" position="bottom-1/3 left-10" />
      <EcosystemNode label="Produção" position="top-1/2 left-5" />
      <EcosystemNode label="Cultivo" position="top-1/4 left-10" />
      
      {/* Círculo externo */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        <div className="rounded-full h-[500px] w-[500px] border-2 border-primary/10"></div>
      </div>
      
      {/* Linhas de conexão (setas) - usando SVG */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="0"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={primaryColor} />
          </marker>
        </defs>
        
        {/* Linhas radiais decorativas */}
        <circle cx="300" cy="300" r="200" stroke={`${primaryColor}20`} strokeWidth="1" strokeDasharray="3 3" />
        
        {/* Setas conectando os nós */}
        <path d="M 300 80 Q 360 120 400 200" stroke={primaryColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
        <path d="M 430 200 Q 450 260 430 300" stroke={primaryColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
        <path d="M 430 300 Q 400 360 400 400" stroke={primaryColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
        <path d="M 400 400 Q 360 460 300 510" stroke={primaryColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
        <path d="M 300 510 Q 240 460 180 400" stroke={primaryColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
        <path d="M 180 400 Q 160 360 170 300" stroke={primaryColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
        <path d="M 170 300 Q 200 240 180 200" stroke={primaryColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
        <path d="M 180 200 Q 240 120 300 80" stroke={primaryColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
      </svg>
    </div>
  );
}