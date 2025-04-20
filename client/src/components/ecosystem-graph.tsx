"use client";
import React, { useState, useEffect } from "react";
import { Leaf, Brain, Sparkles } from "lucide-react";

interface EcosystemNodeProps {
  label: string;
  className?: string;
  position: string;
  delay?: number;
  icon?: React.ReactNode;
}

const EcosystemNode: React.FC<EcosystemNodeProps> = ({ 
  label, 
  className, 
  position, 
  delay = 0,
  icon
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  const isAI = label.includes("Inteligência") || label === "IA";
  const baseClasses = `absolute ${position} flex items-center justify-center bg-green-600 text-white rounded-full px-4 py-2 font-medium shadow-lg hover:bg-green-700 transition-all duration-300 cursor-pointer transform hover:scale-105 ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 ${className}`;

  return (
    <div className={baseClasses}>
      {icon && (
        <span className={`mr-1.5 ${isAI ? 'animate-pulse' : ''}`}>
          {icon}
        </span>
      )}
      {label}
      {isAI && (
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur opacity-30 group-hover:opacity-50 animate-pulse"></div>
      )}
    </div>
  );
};

export function EcosystemGraph() {
  // Cores modernas para o ecossistema
  const primaryColor = "#3A9B6E"; // Verde mais vibrante
  const secondaryColor = "#276749"; // Verde mais escuro
  
  // Estado para controlar a visualização por etapas
  const [renderStep, setRenderStep] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setRenderStep(prev => Math.min(prev + 1, 3));
    }, 200);
    
    return () => clearTimeout(timer);
  }, [renderStep]);
  
  return (
    <div className="relative w-full h-full mx-auto">
      {/* Círculo central com logo */}
      <div className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center bg-white rounded-full h-28 w-28 shadow-xl z-10 border-4 border-green-100 transition-all duration-500 ${renderStep >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <div className="bg-green-50 p-3 rounded-full flex items-center justify-center">
          <Leaf className="h-8 w-8 text-green-600" />
        </div>
        <div className="text-center font-bold text-base mt-1 text-green-800">Endurancy</div>
      </div>
      
      {/* Círculos concêntricos decorativos */}
      <div className={`absolute inset-0 w-full h-full flex items-center justify-center transition-opacity duration-700 ${renderStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="rounded-full h-[240px] w-[240px] border border-green-200"></div>
      </div>
      <div className={`absolute inset-0 w-full h-full flex items-center justify-center transition-opacity duration-700 delay-100 ${renderStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="rounded-full h-[300px] w-[300px] border border-green-100"></div>
      </div>
      
      {/* Nós do ecossistema com delays sequenciais */}
      {renderStep >= 2 && (
        <>
          <EcosystemNode label="Paciente" position="top-4 left-1/2 transform -translate-x-1/2" delay={100} />
          <EcosystemNode label="Médico" position="top-14 right-8" delay={200} />
          <EcosystemNode label="Químico" position="top-1/2 right-4" delay={300} />
          <EcosystemNode label="Produção" position="bottom-1/4 right-8" delay={400} />
          <EcosystemNode label="Financeiro" position="bottom-4 right-1/4" delay={500} />
          <EcosystemNode label="Cultivo" position="bottom-4 left-1/4" delay={600} />
          <EcosystemNode label="Pesquisa" position="bottom-1/4 left-8" delay={700} />
          <EcosystemNode label="Farmácia" position="top-1/2 left-4" delay={800} />
          <EcosystemNode 
            label="Inteligência Artificial" 
            position="bottom-1/2 left-1/2 transform translate-x-6 translate-y-2" 
            delay={900} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold scale-110 py-2.5 px-5"
            icon={<Sparkles className="h-4 w-4" />}
          />
        </>
      )}
      
      {/* Linhas de conexão (setas) - usando SVG */}
      <svg className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${renderStep >= 3 ? 'opacity-100' : 'opacity-0'}`} 
           viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={primaryColor} />
          </marker>
          
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={primaryColor} />
          </linearGradient>
        </defs>
        
        {/* Linhas radiais animadas */}
        <circle cx="200" cy="200" r="140" stroke="url(#lineGradient)" strokeWidth="1" strokeDasharray="3 3">
          <animate attributeName="r" from="130" to="140" dur="8s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" from="0.8" to="0.2" dur="8s" repeatCount="indefinite" />
        </circle>
        
        {/* Setas conectando os nós - curvas mais suaves e modernas */}
        <path d="M 200 60 Q 240 100 280 130" stroke={primaryColor} strokeWidth="1.5" markerEnd="url(#arrowhead)">
          <animate attributeName="stroke-dashoffset" from="1000" to="0" dur="1.5s" />
        </path>
        <path d="M 280 130 Q 300 170 280 210" stroke={primaryColor} strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        <path d="M 280 210 Q 260 250 230 280" stroke={primaryColor} strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        <path d="M 230 280 Q 200 300 170 280" stroke={primaryColor} strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        <path d="M 170 280 Q 140 250 120 210" stroke={primaryColor} strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        <path d="M 120 210 Q 100 170 120 130" stroke={primaryColor} strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        <path d="M 120 130 Q 160 100 200 60" stroke={primaryColor} strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        
        {/* Conexões cruzadas para mostrar integração completa */}
        <path d="M 200 60 Q 210 140 280 210" stroke={secondaryColor} strokeWidth="1" strokeDasharray="4 2" markerEnd="url(#arrowhead)" />
        <path d="M 120 130 Q 180 150 230 280" stroke={secondaryColor} strokeWidth="1" strokeDasharray="4 2" markerEnd="url(#arrowhead)" />
        
        {/* Conexões com a IA */}
        <linearGradient id="iaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4C51BF" />
          <stop offset="100%" stopColor="#9F7AEA" />
        </linearGradient>
        
        {/* Conexões da IA para outros nós */}
        <path d="M 214 214 Q 230 190 280 210" stroke="url(#iaGradient)" strokeWidth="1.5" strokeDasharray="3 2" markerEnd="url(#arrowhead)">
          <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite" />
        </path>
        <path d="M 214 214 Q 190 170 200 60" stroke="url(#iaGradient)" strokeWidth="1.5" strokeDasharray="3 2" markerEnd="url(#arrowhead)">
          <animate attributeName="stroke-dashoffset" from="100" to="0" dur="4s" repeatCount="indefinite" />
        </path>
        <path d="M 214 214 Q 160 210 120 210" stroke="url(#iaGradient)" strokeWidth="1.5" strokeDasharray="3 2" markerEnd="url(#arrowhead)">
          <animate attributeName="stroke-dashoffset" from="100" to="0" dur="5s" repeatCount="indefinite" />
        </path>
        <path d="M 214 214 Q 180 240 170 280" stroke="url(#iaGradient)" strokeWidth="1.5" strokeDasharray="3 2" markerEnd="url(#arrowhead)">
          <animate attributeName="stroke-dashoffset" from="100" to="0" dur="4.5s" repeatCount="indefinite" />
        </path>
        <path d="M 214 214 Q 250 240 230 280" stroke="url(#iaGradient)" strokeWidth="1.5" strokeDasharray="3 2" markerEnd="url(#arrowhead)">
          <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3.7s" repeatCount="indefinite" />
        </path>
        
        {/* Círculo decorativo ao redor da IA */}
        <circle cx="214" cy="214" r="35" stroke="url(#iaGradient)" strokeWidth="2" strokeDasharray="5 3" fill="none" opacity="0.3">
          <animate attributeName="r" from="32" to="38" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.1" to="0.4" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}