// Definição de caminhos SVG (paths) para o mapa do Brasil com formato correto
// Cada estado tem seu próprio path que define o formato no mapa

// Lista de estados brasileiros com seus IDs (siglas) e nomes
export const BRAZILIAN_STATES = [
  { id: "AC", name: "Acre" },
  { id: "AL", name: "Alagoas" },
  { id: "AP", name: "Amapá" },
  { id: "AM", name: "Amazonas" },
  { id: "BA", name: "Bahia" },
  { id: "CE", name: "Ceará" },
  { id: "DF", name: "Distrito Federal" },
  { id: "ES", name: "Espírito Santo" },
  { id: "GO", name: "Goiás" },
  { id: "MA", name: "Maranhão" },
  { id: "MT", name: "Mato Grosso" },
  { id: "MS", name: "Mato Grosso do Sul" },
  { id: "MG", name: "Minas Gerais" },
  { id: "PA", name: "Pará" },
  { id: "PB", name: "Paraíba" },
  { id: "PR", name: "Paraná" },
  { id: "PE", name: "Pernambuco" },
  { id: "PI", name: "Piauí" },
  { id: "RJ", name: "Rio de Janeiro" },
  { id: "RN", name: "Rio Grande do Norte" },
  { id: "RS", name: "Rio Grande do Sul" },
  { id: "RO", name: "Rondônia" },
  { id: "RR", name: "Roraima" },
  { id: "SC", name: "Santa Catarina" },
  { id: "SP", name: "São Paulo" },
  { id: "SE", name: "Sergipe" },
  { id: "TO", name: "Tocantins" }
];

// Coordenadas centrais de cada estado para posicionamento de texto
export const STATE_CENTERS: Record<string, { x: number, y: number }> = {
  'AC': { x: 75, y: 270 },
  'AL': { x: 430, y: 280 },
  'AP': { x: 260, y: 145 },
  'AM': { x: 165, y: 240 },
  'BA': { x: 380, y: 320 },
  'CE': { x: 410, y: 235 },
  'DF': { x: 298, y: 352 },
  'ES': { x: 385, y: 380 },
  'GO': { x: 300, y: 375 },
  'MA': { x: 350, y: 240 },
  'MT': { x: 240, y: 325 },
  'MS': { x: 260, y: 390 },
  'MG': { x: 330, y: 380 },
  'PA': { x: 290, y: 210 },
  'PB': { x: 440, y: 240 },
  'PR': { x: 265, y: 450 },
  'PE': { x: 425, y: 255 },
  'PI': { x: 380, y: 265 },
  'RJ': { x: 355, y: 420 },
  'RN': { x: 435, y: 220 },
  'RS': { x: 230, y: 520 },
  'RO': { x: 150, y: 305 },
  'RR': { x: 180, y: 155 },
  'SC': { x: 250, y: 480 },
  'SP': { x: 295, y: 415 },
  'SE': { x: 410, y: 295 },
  'TO': { x: 320, y: 280 }
};

export const BRASIL_STATE_PATHS: Record<string, string> = {
  // Norte
  'AM': 'M185,205 L125,210 L95,220 L90,255 L110,275 L120,295 L150,295 L165,280 L195,280 L215,260 L240,240 L240,220 L220,210 Z',
  'RR': 'M180,135 L155,140 L165,160 L175,180 L195,170 L210,150 L200,135 Z',
  'AP': 'M255,135 L240,145 L245,160 L260,165 L280,155 L285,140 L270,130 Z',
  'PA': 'M240,220 L240,240 L275,240 L300,230 L325,235 L340,225 L335,205 L315,190 L300,180 L290,165 L280,155 L260,165 L245,175 L225,180 L220,200 Z',
  'AC': 'M90,255 L70,260 L60,270 L75,290 L110,275 Z',
  'RO': 'M120,295 L130,310 L155,325 L175,315 L195,280 L165,280 L150,295 Z',
  'TO': 'M300,230 L300,270 L320,305 L340,310 L340,290 L355,280 L340,255 L325,235 Z',
  
  // Nordeste
  'MA': 'M340,225 L360,215 L375,230 L355,255 L340,255 L325,235 Z',
  'PI': 'M355,255 L375,230 L390,240 L405,260 L380,300 L355,280 L340,290 L340,255 Z',
  'CE': 'M390,240 L400,215 L420,210 L430,230 L410,260 L405,260 Z',
  'RN': 'M420,210 L440,210 L450,225 L435,235 L420,230 Z',
  'PB': 'M435,235 L450,225 L460,235 L445,250 L430,245 Z',
  'PE': 'M430,245 L445,250 L440,265 L415,270 L400,285 L380,300 L405,260 L410,260 Z',
  'AL': 'M415,270 L440,265 L445,285 L425,290 Z',
  'SE': 'M400,285 L425,290 L420,305 L400,300 Z',
  'BA': 'M340,310 L380,300 L400,285 L400,300 L420,305 L410,330 L380,370 L360,350 L330,335 L340,310 Z',
  
  // Centro-Oeste
  'MT': 'M175,315 L195,335 L210,355 L240,360 L260,350 L290,355 L300,345 L300,270 L300,230 L275,240 L240,240 L215,260 L195,280 Z',
  'MS': 'M240,360 L230,390 L240,425 L260,430 L280,410 L290,380 L290,355 L260,350 Z',
  'GO': 'M290,355 L300,345 L320,365 L315,385 L295,395 L280,410 L290,380 Z',
  'DF': 'M300,345 L305,355 L295,360 L290,355 Z',
  
  // Sudeste
  'MG': 'M320,365 L345,365 L375,370 L380,390 L365,410 L340,415 L315,400 L295,395 L315,385 Z',
  'ES': 'M375,370 L390,370 L395,395 L380,390 Z',
  'RJ': 'M340,415 L365,410 L370,425 L350,430 L330,425 Z',
  'SP': 'M260,430 L280,410 L295,395 L315,400 L340,415 L330,425 L310,430 L290,440 L280,435 Z',
  
  // Sul
  'PR': 'M260,430 L280,435 L290,440 L285,455 L260,465 L240,465 L230,445 Z',
  'SC': 'M240,465 L260,465 L265,480 L250,500 L230,490 Z',
  'RS': 'M230,490 L250,500 L245,520 L225,540 L200,540 L190,525 L210,505 Z'
};

// Tabela de cores dos estados por região
export const STATE_COLORS_BY_REGION: Record<string, string> = {
  // Norte - tons de verde
  'AM': '#009B77',
  'RR': '#006B54',
  'AP': '#00876C',
  'PA': '#4CB5AB',
  'AC': '#016A70',
  'RO': '#0A7373',
  'TO': '#3AA6B9',
  
  // Nordeste - tons de amarelo/laranja
  'MA': '#FEBE10',
  'PI': '#E56E00',
  'CE': '#FFB100',
  'RN': '#FFC436',
  'PB': '#FFA732',
  'PE': '#E5890A',
  'AL': '#F5BD1F',
  'SE': '#FF8C32',
  'BA': '#F4A746',
  
  // Centro-Oeste - tons de roxo
  'MT': '#7360DF',
  'MS': '#8D80E6',
  'GO': '#9681EB',
  'DF': '#6153C7',
  
  // Sudeste - tons de azul
  'MG': '#0C356A',
  'ES': '#1864AB',
  'RJ': '#279EFF',
  'SP': '#0766AD',
  
  // Sul - tons de vermelho
  'PR': '#C51605',
  'SC': '#DE1A3A',
  'RS': '#B80000'
};

// Paleta para tons de cinza (do mais claro ao mais escuro)
export const GRAYSCALE_PALETTE = [
  '#F0F0F0',
  '#E0E0E0',
  '#D0D0D0',
  '#C0C0C0',
  '#B0B0B0',
  '#A0A0A0',
  '#909090',
  '#808080',
  '#707070',
  '#606060',
  '#505050',
  '#404040',
  '#303030'
];