"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  Leaf, 
  Cpu, 
  Users, 
  FlaskConical, 
  Database, 
  BarChart3, 
  Pill, 
  Microscope, 
  Sprout,
  ZapIcon,
  CircleIcon,
  HeartPulse
} from "lucide-react";

type NodePosition = {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  rotation: number;
};

interface EcosystemNodeProps {
  label: string;
  icon: React.ReactNode;
  initialPosition: NodePosition;
  delay?: number;
  isAI?: boolean;
  onHover: (label: string, isHovered: boolean) => void;
  isHovered: boolean;
  activeNode: string | null;
  colorClass: string;
  secondaryColor: string;
  highlightColor: string;
  lineRef?: React.RefObject<SVGPathElement>;
}

const EcosystemNode: React.FC<EcosystemNodeProps> = ({ 
  label, 
  icon,
  initialPosition, 
  delay = 0,
  isAI = false,
  onHover,
  isHovered,
  activeNode,
  colorClass,
  secondaryColor,
  highlightColor,
  lineRef
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // Efeito para animação inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  // Efeito para animação de destaque e movimento
  useEffect(() => {
    if (isHovered) {
      // Mover o nó para o centro (zoom in)
      setPosition({
        x: initialPosition.x * 0.7, // Move 30% em direção ao centro
        y: initialPosition.y * 0.7, // Move 30% em direção ao centro 
        scale: 1.15,
        opacity: 1,
        rotation: initialPosition.rotation + 5
      });
    } else if (activeNode && activeNode !== label) {
      // Diminuir nós não ativos quando outro está destacado
      setPosition({
        x: initialPosition.x * 1.05, // Afasta levemente
        y: initialPosition.y * 1.05, // Afasta levemente
        scale: 0.9,
        opacity: 0.8,
        rotation: initialPosition.rotation
      });
    } else {
      // Posição normal
      setPosition(initialPosition);
    }
  }, [isHovered, activeNode, label]);

  return (
    <div 
      ref={nodeRef}
      className={`absolute flex items-center justify-center ${isHovered ? highlightColor : colorClass} text-white rounded-full px-3 py-2 font-medium shadow-md cursor-pointer z-10 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        left: `${50 + position.x}%`,
        top: `${50 + position.y}%`,
        transform: `translate(-50%, -50%) scale(${position.scale}) rotate(${position.rotation}deg)`,
        opacity: position.opacity,
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
      onMouseEnter={() => onHover(label, true)}
      onMouseLeave={() => onHover(label, false)}
    >
      <div className="relative flex items-center">
        <span className={`mr-2 ${isHovered ? 'animate-pulse' : ''}`}>
          {icon}
        </span>
        {label}
        
        {isHovered && (
          <div className="absolute -inset-1 rounded-full opacity-20 animate-pulse" 
               style={{ backgroundColor: secondaryColor }}></div>
        )}
      </div>
    </div>
  );
};

// Componente para linhas de conexão com animação
const AnimatedConnectionLine: React.FC<{
  start: { x: number; y: number };
  end: { x: number; y: number };
  color: string;
  delay: number;
  isHighlighted: boolean;
}> = ({ start, end, color, delay, isHighlighted }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [length, setLength] = useState(0);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (pathRef.current) {
      const pathLength = pathRef.current.getTotalLength();
      setLength(pathLength);
      
      setTimeout(() => {
        setAnimated(true);
      }, delay);
    }
  }, [pathRef, delay]);

  // Calcular pontos de controle para curvas Bezier
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  
  // Adiciona um deslocamento para criar uma curva mais natural
  const offset = Math.min(Math.abs(start.x - end.x), Math.abs(start.y - end.y)) * 0.3;
  
  // Caminho como uma curva Bezier
  const path = `M ${start.x},${start.y} Q ${midX + offset},${midY - offset} ${end.x},${end.y}`;

  return (
    <path
      ref={pathRef}
      d={path}
      stroke={color}
      strokeWidth={isHighlighted ? 2 : 1}
      fill="none"
      strokeDasharray={length}
      strokeDashoffset={animated ? 0 : length}
      style={{ 
        transition: 'stroke-dashoffset 1.5s ease-in-out, stroke-width 0.3s ease, opacity 0.3s ease',
        opacity: isHighlighted ? 1 : 0.6
      }}
    />
  );
};

export function EcosystemGraphV2() {
  const [renderStep, setRenderStep] = useState(0);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [centerEffects, setCenterEffects] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Cores para os diferentes tipos de nós
  const colors = {
    primary: "#2563eb", // Azul mais vibrante
    secondary: "#ec4899", // Rosa
    tertiary: "#8b5cf6", // Roxo
    quaternary: "#10b981", // Verde esmeralda
    highlight: "#f97316", // Laranja para highlight
    ai: "#6366f1", // Roxo-azulado para IA
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setRenderStep(prev => Math.min(prev + 1, 4));
    }, 400);
    
    return () => clearTimeout(timer);
  }, [renderStep]);
  
  // Função para lidar com hover nos nós
  const handleNodeHover = (label: string, isHovered: boolean) => {
    setHoveredNode(isHovered ? label : null);
    setCenterEffects(isHovered);
  };
  
  // Calcular posição com base em ângulo e distância
  const calculatePosition = (angle: number, distance: number, rotation: number = 0): NodePosition => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: distance * Math.cos(radian),
      y: distance * Math.sin(radian),
      scale: 1,
      opacity: 1,
      rotation
    };
  };
  
  // Definição dos nós - agora com posições baseadas em ângulo/distância
  // e agrupadas por categoria com cores diferentes
  const nodes = [
    // Grupo 1 - Usuários (Azul)
    { 
      label: "Paciente", 
      icon: <Users size={18} />, 
      position: calculatePosition(0, 33, -5), 
      delay: 100,
      colorClass: "bg-blue-600 hover:bg-blue-700",
      secondaryColor: colors.primary,
      highlightColor: "bg-blue-500"
    },
    { 
      label: "Médico", 
      icon: <HeartPulse size={18} />, 
      position: calculatePosition(40, 33, 5), 
      delay: 150,
      colorClass: "bg-blue-600 hover:bg-blue-700",
      secondaryColor: colors.primary,
      highlightColor: "bg-blue-500"
    },
    
    // Grupo 2 - Serviços (Rosa)
    { 
      label: "Farmácia", 
      icon: <Pill size={18} />, 
      position: calculatePosition(90, 30, 15), 
      delay: 200,
      colorClass: "bg-pink-600 hover:bg-pink-700",
      secondaryColor: colors.secondary,
      highlightColor: "bg-pink-500"
    },
    { 
      label: "Químico", 
      icon: <FlaskConical size={18} />, 
      position: calculatePosition(130, 30, -10), 
      delay: 250,
      colorClass: "bg-pink-600 hover:bg-pink-700",
      secondaryColor: colors.secondary,
      highlightColor: "bg-pink-500"
    },
    
    // Grupo 3 - Operações (Roxo)
    { 
      label: "Produção", 
      icon: <Database size={18} />, 
      position: calculatePosition(180, 32, 0), 
      delay: 300,
      colorClass: "bg-purple-600 hover:bg-purple-700",
      secondaryColor: colors.tertiary,
      highlightColor: "bg-purple-500"
    },
    { 
      label: "Financeiro", 
      icon: <BarChart3 size={18} />, 
      position: calculatePosition(220, 32, 10), 
      delay: 350,
      colorClass: "bg-purple-600 hover:bg-purple-700",
      secondaryColor: colors.tertiary,
      highlightColor: "bg-purple-500"
    },
    
    // Grupo 4 - Pesquisa (Verde)
    { 
      label: "Cultivo", 
      icon: <Sprout size={18} />, 
      position: calculatePosition(270, 31, -5), 
      delay: 400,
      colorClass: "bg-emerald-600 hover:bg-emerald-700",
      secondaryColor: colors.quaternary,
      highlightColor: "bg-emerald-500"
    },
    { 
      label: "Pesquisa", 
      icon: <Microscope size={18} />, 
      position: calculatePosition(315, 31, 5), 
      delay: 450,
      colorClass: "bg-emerald-600 hover:bg-emerald-700",
      secondaryColor: colors.quaternary,
      highlightColor: "bg-emerald-500" 
    },
    
    // IA - Elemento especial (Indigo)
    { 
      label: "IA", 
      icon: <Cpu size={18} />, 
      position: calculatePosition(0, 0, 0), // Centralizada
      delay: 800,
      isAI: true,
      colorClass: "bg-indigo-600 hover:bg-indigo-700",
      secondaryColor: colors.ai,
      highlightColor: "bg-indigo-500" 
    }
  ];
  
  // Define conexões entre nós
  const connections = [
    // Conexões em sequência
    { from: "Paciente", to: "Médico", color: colors.primary, delay: 600 },
    { from: "Médico", to: "Farmácia", color: colors.secondary, delay: 650 },
    { from: "Farmácia", to: "Químico", color: colors.secondary, delay: 700 },
    { from: "Químico", to: "Produção", color: colors.tertiary, delay: 750 },
    { from: "Produção", to: "Financeiro", color: colors.tertiary, delay: 800 },
    { from: "Financeiro", to: "Cultivo", color: colors.quaternary, delay: 850 },
    { from: "Cultivo", to: "Pesquisa", color: colors.quaternary, delay: 900 },
    { from: "Pesquisa", to: "Paciente", color: colors.primary, delay: 950 },
    
    // Conexões cruzadas
    { from: "Médico", to: "Pesquisa", color: "#a3a3a3", delay: 1000 },
    { from: "Farmácia", to: "Financeiro", color: "#a3a3a3", delay: 1050 },
    { from: "Químico", to: "Cultivo", color: "#a3a3a3", delay: 1100 },
    
    // Conexões com IA
    { from: "IA", to: "Paciente", color: colors.ai, delay: 1150 },
    { from: "IA", to: "Farmácia", color: colors.ai, delay: 1200 },
    { from: "IA", to: "Produção", color: colors.ai, delay: 1250 },
    { from: "IA", to: "Pesquisa", color: colors.ai, delay: 1300 },
  ];
  
  // Encontra a posição do nó no SVG
  const getNodeCenter = (label: string) => {
    const node = nodes.find(n => n.label === label);
    if (!node) return { x: 50, y: 50 };
    
    // Convertendo a posição para coordenadas SVG (0-100)
    return { 
      x: 50 + node.position.x, 
      y: 50 + node.position.y 
    };
  };
  
  // Calcula se uma conexão deve ser destacada
  const isConnectionHighlighted = (from: string, to: string) => {
    return hoveredNode === from || hoveredNode === to;
  };
  
  return (
    <div className="relative w-full h-full mx-auto aspect-square bg-gray-50 rounded-xl shadow-inner overflow-hidden">
      {/* Gradiente de fundo sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70"></div>
      
      {/* Grade de fundo */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${renderStep >= 1 ? 'opacity-30' : 'opacity-0'}`}>
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Círculos concêntricos decorativos */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${renderStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full border border-gray-200"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full border border-gray-200"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full border border-gray-200"></div>
      </div>
      
      {/* SVG com linhas de conexão */}
      {renderStep >= 3 && (
        <svg 
          ref={svgRef}
          className="absolute inset-0 w-full h-full z-0"
          viewBox="0 0 100 100" 
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Círculo central de conectividade */}
          <circle 
            cx="50" 
            cy="50" 
            r={centerEffects ? "3" : "2"} 
            fill="#3b82f6" 
            className={centerEffects ? "animate-ping" : ""}
            style={{ transition: "r 0.3s ease" }}
          />
          
          {/* Linhas de conexão animadas */}
          <g>
            {connections.map((conn, idx) => {
              const start = getNodeCenter(conn.from);
              const end = getNodeCenter(conn.to);
              const isHighlighted = isConnectionHighlighted(conn.from, conn.to);
              
              return (
                <AnimatedConnectionLine 
                  key={`${conn.from}-${conn.to}`}
                  start={start}
                  end={end}
                  color={isHighlighted ? (conn.color || "#888") : (conn.color || "#888")}
                  delay={conn.delay}
                  isHighlighted={isHighlighted}
                />
              );
            })}
          </g>
          
          {/* Partículas de dados animadas */}
          {renderStep >= 4 && hoveredNode && connections
            .filter(conn => conn.from === hoveredNode || conn.to === hoveredNode)
            .map((conn, idx) => {
              const start = getNodeCenter(conn.from);
              const end = getNodeCenter(conn.to);
              
              return (
                <circle 
                  key={`particle-${idx}`}
                  cx="0" 
                  cy="0" 
                  r="1.5"
                  fill={conn.color || "#888"}
                >
                  <animateMotion
                    path={`M ${start.x},${start.y} Q ${(start.x + end.x) / 2 + 5},${(start.y + end.y) / 2 - 5} ${end.x},${end.y}`}
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              );
            })
          }
        </svg>
      )}
      
      {/* Círculo central com logo */}
      <div 
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center bg-white rounded-full h-16 w-16 shadow-md z-20 border-2 ${centerEffects ? 'border-blue-400 shadow-lg scale-110' : 'border-blue-100'} transition-all duration-300 ${renderStep >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
      >
        <div className={`bg-blue-50 p-2 rounded-full flex items-center justify-center ${centerEffects ? 'bg-blue-100' : ''}`}>
          <Leaf className={`h-7 w-7 text-blue-600 ${centerEffects ? 'animate-pulse' : ''}`} />
        </div>
        {centerEffects && (
          <>
            <div className="absolute -inset-2 rounded-full border border-blue-300 opacity-50 animate-ping" />
            <div className="absolute -inset-3 rounded-full border border-blue-200 opacity-30 animate-ping delay-300" />
          </>
        )}
      </div>
      
      {/* Nós do ecossistema */}
      {renderStep >= 2 && nodes.map((node, index) => (
        <EcosystemNode
          key={node.label}
          label={node.label}
          icon={node.icon}
          initialPosition={node.position}
          delay={node.delay}
          isAI={node.isAI}
          onHover={handleNodeHover}
          isHovered={hoveredNode === node.label}
          activeNode={hoveredNode}
          colorClass={node.colorClass}
          secondaryColor={node.secondaryColor}
          highlightColor={node.highlightColor}
        />
      ))}
      
      {/* Nome da plataforma */}
      <div 
        className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center transition-opacity duration-500 ${renderStep >= 2 ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="text-lg font-bold text-blue-600">Endurancy</div>
        <div className="text-xs text-gray-500">Ecossistema Integrado</div>
      </div>
    </div>
  );
}