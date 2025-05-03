import React from 'react';

interface BrasilMapSVGProps {
  className?: string;
  selectedState?: string;
  highlightedStates?: string[];
  onStateClick?: (stateCode: string) => void;
  showLabels?: boolean;
}

// Definição da estrutura de dados para as informações dos estados brasileiros
interface StateData {
  code: string;
  name: string;
  path: string;
  labelX: number;
  labelY: number;
}

// Informações dos estados brasileiros
const brasilStates: StateData[] = [
  {
    code: 'AC',
    name: 'Acre',
    path: 'M21,379 L50,365 L57,375 L73,370 L98,345 L95,334 L64,341 L40,341 L15,352 Z',
    labelX: 50,
    labelY: 357
  },
  {
    code: 'AM',
    name: 'Amazonas',
    path: 'M95,334 L98,345 L127,329 L142,345 L175,356 L190,348 L220,334 L242,288 L225,269 L235,252 L218,240 L156,258 L150,230 L135,218 L118,231 L100,230 L84,250 L95,264 L75,280 L64,291 L75,313 L64,341 Z',
    labelX: 170,
    labelY: 290
  },
  {
    code: 'RR',
    name: 'Roraima',
    path: 'M150,230 L156,258 L218,240 L235,198 L230,185 L200,185 L182,212 L164,210 L150,180 L135,218 Z',
    labelX: 190,
    labelY: 210
  },
  {
    code: 'AP',
    name: 'Amapá',
    path: 'M266,202 L258,180 L240,170 L228,153 L206,153 L220,175 L230,185 L235,198 L245,205 Z',
    labelX: 235,
    labelY: 175
  },
  {
    code: 'PA',
    name: 'Pará',
    path: 'M220,334 L242,288 L225,269 L235,252 L218,240 L235,198 L245,205 L266,202 L277,218 L298,208 L310,240 L335,240 L350,262 L330,287 L338,310 L320,333 L290,350 L265,345 L240,365 L230,353 L220,380 L190,348 Z',
    labelX: 280,
    labelY: 275
  },
  {
    code: 'MA',
    name: 'Maranhão',
    path: 'M350,262 L335,240 L345,232 L380,232 L395,255 L405,265 L395,280 L410,290 L400,310 L375,300 L330,287 L338,310 Z',
    labelX: 370,
    labelY: 275
  },
  {
    code: 'TO',
    name: 'Tocantins',
    path: 'M330,287 L338,310 L320,333 L290,350 L295,365 L305,380 L325,390 L335,380 L350,395 L375,385 L358,360 L365,345 L348,330 L358,315 L375,300 Z',
    labelX: 340,
    labelY: 345
  },
  {
    code: 'RO',
    name: 'Rondônia',
    path: 'M175,356 L190,348 L220,380 L230,390 L242,410 L225,435 L195,425 L180,395 L142,345 L127,329 Z',
    labelX: 200,
    labelY: 370
  },
  {
    code: 'MT',
    name: 'Mato Grosso',
    path: 'M220,380 L230,390 L242,410 L225,435 L240,450 L257,462 L265,435 L290,430 L305,440 L335,430 L340,410 L325,390 L305,380 L295,365 L290,350 L265,345 L240,365 L230,353 Z',
    labelX: 265,
    labelY: 410
  },
  {
    code: 'MS',
    name: 'Mato Grosso do Sul',
    path: 'M257,462 L265,435 L290,430 L305,440 L315,470 L305,490 L280,498 L272,530 L250,525 L240,505 L225,498 L235,475 Z',
    labelX: 280,
    labelY: 490
  },
  {
    code: 'GO',
    name: 'Goiás',
    path: 'M305,440 L335,430 L340,410 L325,390 L335,380 L350,395 L375,385 L392,397 L375,425 L380,440 L365,455 L345,455 L330,480 L315,470 Z',
    labelX: 345,
    labelY: 430
  },
  {
    code: 'DF',
    name: 'Distrito Federal',
    path: 'M358,432 L365,426 L375,425 L374,435 L365,442 L358,438 Z',
    labelX: 366,
    labelY: 433
  },
  {
    code: 'BA',
    name: 'Bahia',
    path: 'M400,350 L410,340 L430,355 L445,340 L465,345 L475,330 L465,305 L425,320 L410,290 L400,310 L375,300 L358,315 L348,330 L365,345 L358,360 L375,385 L392,397 L375,425 L380,440 L390,455 L410,455 L425,430 L435,408 L425,390 L430,375 L415,365 Z',
    labelX: 415,
    labelY: 370
  },
  {
    code: 'PI',
    name: 'Piauí',
    path: 'M400,310 L410,290 L395,280 L405,265 L410,240 L425,215 L435,240 L450,250 L452,275 L430,305 L425,320 L410,340 L400,350 L415,365 L430,375 L425,390 L405,392 L385,370 L378,350 L390,340 Z',
    labelX: 420,
    labelY: 310
  },
  {
    code: 'CE',
    name: 'Ceará',
    path: 'M435,240 L455,230 L465,210 L485,205 L495,230 L475,255 L480,280 L450,270 L452,275 Z',
    labelX: 455,
    labelY: 230
  },
  {
    code: 'PE',
    name: 'Pernambuco',
    path: 'M445,340 L465,345 L475,330 L495,325 L515,310 L535,310 L545,328 L520,335 L500,348 Z',
    labelX: 505,
    labelY: 328
  },
  {
    code: 'AL',
    name: 'Alagoas',
    path: 'M515,310 L535,310 L545,328 L555,332 L545,345 L530,345 L520,335 Z',
    labelX: 538,
    labelY: 330
  },
  {
    code: 'SE',
    name: 'Sergipe',
    path: 'M500,348, L520,335 L530,345 L525,355 L507,353 Z',
    labelX: 515,
    labelY: 350
  },
  {
    code: 'RN',
    name: 'Rio Grande do Norte',
    path: 'M475,255 L480,280 L500,290 L525,280 L530,265 L505,260 L495,230 Z',
    labelX: 505,
    labelY: 270
  },
  {
    code: 'PB',
    name: 'Paraíba',
    path: 'M480,280 L500,290 L525,280 L535,295 L515,310 L495,325 L475,330 L465,305 L450,270 Z',
    labelX: 500,
    labelY: 300
  },
  {
    code: 'SP',
    name: 'São Paulo',
    path: 'M330,480 L345,455 L365,455 L370,475 L385,470 L400,485 L385,510 L370,520 L350,512 L330,530 L310,530 L305,490 L315,470 Z',
    labelX: 345,
    labelY: 490
  },
  {
    code: 'MG',
    name: 'Minas Gerais',
    path: 'M365,455 L380,440 L390,455 L410,455 L425,430 L435,408 L425,390 L445,380 L470,400 L472,425 L440,445 L425,475 L400,485 L385,470 L370,475 L365,455 Z',
    labelX: 415,
    labelY: 445
  },
  {
    code: 'ES',
    name: 'Espírito Santo',
    path: 'M445,380 L470,400 L472,425 L490,420 L495,400 L475,375 L455,375 Z',
    labelX: 470,
    labelY: 400
  },
  {
    code: 'RJ',
    name: 'Rio de Janeiro',
    path: 'M400,485 L425,475 L440,445 L472,425 L490,420 L415,445 L405,475 L390,480 Z',
    labelX: 430,
    labelY: 465
  },
  {
    code: 'PR',
    name: 'Paraná',
    path: 'M305,490 L310,530 L330,530 L350,512 L370,520 L385,510 L325,555 L290,555 L280,535 L280,498 Z',
    labelX: 320,
    labelY: 530
  },
  {
    code: 'SC',
    name: 'Santa Catarina',
    path: 'M280,535 L290,555 L325,555 L320,570 L295,595 L275,575 L272,530 Z',
    labelX: 295,
    labelY: 570
  },
  {
    code: 'RS',
    name: 'Rio Grande do Sul',
    path: 'M272,530 L275,575 L295,595 L325,625 L265,650 L225,630 L240,575 L250,525 Z',
    labelX: 270,
    labelY: 600
  }
];

const BrasilMapSVG: React.FC<BrasilMapSVGProps> = ({
  className = '',
  selectedState,
  highlightedStates = [],
  onStateClick,
  showLabels = true
}) => {
  const handleStateClick = (stateCode: string) => {
    if (onStateClick) {
      onStateClick(stateCode);
    }
  };

  // Função para determinar a cor de preenchimento do estado
  const getStateFill = (stateCode: string) => {
    if (selectedState === stateCode) {
      return '#3b82f6'; // Azul para o estado selecionado
    }
    if (highlightedStates.includes(stateCode)) {
      return '#60a5fa'; // Azul mais claro para estados destacados
    }
    return '#e5e7eb'; // Cinza claro para estados normais
  };

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 600 700" 
      className={className}
    >
      <g>
        {/* Renderiza todos os estados */}
        {brasilStates.map((state) => (
          <path
            key={state.code}
            id={`state-${state.code}`}
            d={state.path}
            fill={getStateFill(state.code)}
            stroke="#ffffff"
            strokeWidth="1"
            onClick={() => handleStateClick(state.code)}
            className="transition-colors duration-200 cursor-pointer hover:fill-blue-400"
            data-state-code={state.code}
            data-state-name={state.name}
          />
        ))}

        {/* Adiciona os nomes dos estados se showLabels for true */}
        {showLabels && brasilStates.map((state) => (
          <text
            key={`label-${state.code}`}
            x={state.labelX}
            y={state.labelY}
            textAnchor="middle"
            fontSize="12"
            fill="#333333"
            className="pointer-events-none"
          >
            {state.code}
          </text>
        ))}
      </g>
    </svg>
  );
};

export default BrasilMapSVG;