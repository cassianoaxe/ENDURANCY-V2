"use client";
import React, { useState, useEffect } from "react";
import { Leaf, Cpu, Users, FlaskConical, Database, BarChart3, Pill, Microscope, Sprout } from "lucide-react";

interface EcosystemNodeProps {
  label: string;
  icon: React.ReactNode;
  angle: number;
  delay?: number;
  radius: number;
  isAI?: boolean;
}

const EcosystemNode: React.FC<EcosystemNodeProps> = ({ 
  label, 
  icon,
  angle, 
  delay = 0,
  radius,
  isAI = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  // Calcular posição baseada em ângulo e raio
  const angleRad = (angle * Math.PI) / 180;
  const x = 50 + radius * Math.cos(angleRad);
  const y = 50 + radius * Math.sin(angleRad);
  
  const nodeColor = isAI ? "bg-indigo-600 hover:bg-indigo-700" : "bg-green-600 hover:bg-green-700";
  
  return (
    <div 
      className={`absolute flex items-center justify-center ${nodeColor} text-white rounded-full px-3 py-1.5 font-medium shadow-md transition-all duration-500 cursor-pointer transform hover:scale-105 z-10 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <span className="mr-1.5">{icon}</span>
      {label}
    </div>
  );
};

export function EcosystemGraph() {
  const [renderStep, setRenderStep] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setRenderStep(prev => Math.min(prev + 1, 3));
    }, 200);
    
    return () => clearTimeout(timer);
  }, [renderStep]);
  
  // Definição dos nós - distribuídos uniformemente ao redor do círculo
  const nodes = [
    { label: "Paciente", icon: <Users size={16} />, angle: 0, delay: 100 },
    { label: "Médico", icon: <Users size={16} />, angle: 40, delay: 150 },
    { label: "Farmácia", icon: <Pill size={16} />, angle: 80, delay: 200 },
    { label: "Químico", icon: <FlaskConical size={16} />, angle: 120, delay: 250 },
    { label: "Produção", icon: <Database size={16} />, angle: 160, delay: 300 },
    { label: "Financeiro", icon: <BarChart3 size={16} />, angle: 200, delay: 350 },
    { label: "Cultivo", icon: <Sprout size={16} />, angle: 240, delay: 400 },
    { label: "Pesquisa", icon: <Microscope size={16} />, angle: 280, delay: 450 },
    { label: "IA", icon: <Cpu size={16} />, angle: 320, delay: 500, isAI: true }
  ];
  
  return (
    <div className="relative w-full h-full mx-auto aspect-square">
      {/* Fundo com círculos concêntricos */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${renderStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] rounded-full border border-green-200"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[65%] h-[65%] rounded-full border border-green-200"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full border border-green-200"></div>
      </div>
      
      {/* Círculo central com logo */}
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center bg-white rounded-full h-24 w-24 shadow-md z-20 border-2 border-green-100 transition-all duration-500 ${renderStep >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <div className="bg-green-50 p-2 rounded-full flex items-center justify-center">
          <Leaf className="h-7 w-7 text-green-600" />
        </div>
        <div className="text-center font-bold text-sm mt-1 text-green-800">Endurancy</div>
      </div>
      
      {/* Nós do ecossistema */}
      {renderStep >= 2 && nodes.map((node, index) => (
        <EcosystemNode
          key={node.label}
          label={node.label}
          icon={node.icon}
          angle={node.angle}
          delay={node.delay}
          radius={42}
          isAI={node.isAI}
        />
      ))}
      
      {/* Linhas de conexão como SVG */}
      <svg 
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${renderStep >= 3 ? 'opacity-100' : 'opacity-0'}`}
        viewBox="0 0 100 100" 
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#3A9B6E" />
          </marker>
          
          <marker
            id="aiArrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#6366F1" />
          </marker>
        </defs>
        
        {/* Conexões regulares entre nós adjacentes */}
        <path d="M 50 8 Q 65 20 74 30" stroke="#3A9B6E" strokeWidth="0.7" markerEnd="url(#arrowhead)" />
        <path d="M 74 30 Q 85 45 82 50" stroke="#3A9B6E" strokeWidth="0.7" markerEnd="url(#arrowhead)" />
        <path d="M 82 50 Q 80 65 74 70" stroke="#3A9B6E" strokeWidth="0.7" markerEnd="url(#arrowhead)" />
        <path d="M 74 70 Q 65 80 50 92" stroke="#3A9B6E" strokeWidth="0.7" markerEnd="url(#arrowhead)" />
        <path d="M 50 92 Q 35 80 26 70" stroke="#3A9B6E" strokeWidth="0.7" markerEnd="url(#arrowhead)" />
        <path d="M 26 70 Q 20 65 18 50" stroke="#3A9B6E" strokeWidth="0.7" markerEnd="url(#arrowhead)" />
        <path d="M 18 50 Q 20 35 26 30" stroke="#3A9B6E" strokeWidth="0.7" markerEnd="url(#arrowhead)" />
        <path d="M 26 30 Q 35 20 50 8" stroke="#3A9B6E" strokeWidth="0.7" markerEnd="url(#arrowhead)" />
        
        {/* Conexões da IA com outros nós */}
        <path d="M 71 26 Q 60 45 50 50" stroke="#6366F1" strokeWidth="0.6" strokeDasharray="2 1" markerEnd="url(#aiArrowhead)">
          <animate attributeName="stroke-dashoffset" from="100" to="0" dur="8s" repeatCount="indefinite" />
        </path>
        <path d="M 71 26 Q 80 50 74 70" stroke="#6366F1" strokeWidth="0.6" strokeDasharray="2 1" markerEnd="url(#aiArrowhead)">
          <animate attributeName="stroke-dashoffset" from="100" to="0" dur="6s" repeatCount="indefinite" />
        </path>
        <path d="M 71 26 Q 50 70 26 70" stroke="#6366F1" strokeWidth="0.6" strokeDasharray="2 1" markerEnd="url(#aiArrowhead)">
          <animate attributeName="stroke-dashoffset" from="100" to="0" dur="7s" repeatCount="indefinite" />
        </path>
        <path d="M 71 26 Q 40 30 26 30" stroke="#6366F1" strokeWidth="0.6" strokeDasharray="2 1" markerEnd="url(#aiArrowhead)">
          <animate attributeName="stroke-dashoffset" from="100" to="0" dur="5s" repeatCount="indefinite" />
        </path>
        
        {/* Círculo concêntrico animado ao redor do nó central */}
        <circle cx="50" cy="50" r="14" stroke="#3A9B6E" strokeWidth="0.5" fill="none" strokeDasharray="2 2">
          <animate attributeName="r" values="14;16;14" dur="5s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="5s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}