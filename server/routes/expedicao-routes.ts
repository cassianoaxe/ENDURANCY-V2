import { Router } from 'express';
import { db } from '../db';
import { eq, sql } from 'drizzle-orm';

const router = Router();

// Dados simulados para entregas por estado
const estadosData = {
  "AC": "Acre",
  "AL": "Alagoas",
  "AP": "Amapá",
  "AM": "Amazonas",
  "BA": "Bahia",
  "CE": "Ceará",
  "DF": "Distrito Federal",
  "ES": "Espírito Santo",
  "GO": "Goiás",
  "MA": "Maranhão",
  "MT": "Mato Grosso",
  "MS": "Mato Grosso do Sul",
  "MG": "Minas Gerais",
  "PA": "Pará",
  "PB": "Paraíba",
  "PR": "Paraná",
  "PE": "Pernambuco",
  "PI": "Piauí",
  "RJ": "Rio de Janeiro",
  "RN": "Rio Grande do Norte",
  "RS": "Rio Grande do Sul",
  "RO": "Rondônia",
  "RR": "Roraima",
  "SC": "Santa Catarina",
  "SP": "São Paulo",
  "SE": "Sergipe",
  "TO": "Tocantins"
};

// Função para gerar dados de teste com alguma variação baseada no período
function gerarDadosEnviosPorEstado(periodo: string) {
  // Fator de multiplicação com base no período para criar alguma variação
  const fatorPeriodo = {
    'daily': 1,
    'weekly': 7,
    'monthly': 30,
    'yearly': 365
  }[periodo] || 1;
  
  // Dados base de exemplo para São Paulo, Rio de Janeiro e Minas Gerais
  const dadosBase = {
    'SP': 150,
    'RJ': 100,
    'MG': 80,
    'RS': 60,
    'PR': 55,
    'SC': 45,
    'BA': 40,
    'PE': 35,
    'CE': 30,
    'GO': 25,
    'DF': 20,
    'AM': 15,
    'PA': 12,
    'ES': 10,
    'MT': 8,
    'MS': 7,
    'MA': 6,
    'PB': 5,
    'RN': 4,
    'AL': 3,
    'PI': 3,
    'SE': 2,
    'RO': 2,
    'TO': 2,
    'AC': 1,
    'AP': 1,
    'RR': 1
  };
  
  // Gerar dados com valores baseados no período e adicionar variação aleatória
  return Object.entries(estadosData).map(([sigla, nome]) => {
    const valorBase = dadosBase[sigla] || 1;
    const variacao = Math.random() * 0.3 - 0.15; // Variação de -15% a +15%
    const valor = Math.round(valorBase * fatorPeriodo * (1 + variacao));
    
    return {
      id: sigla,
      name: nome,
      value: valor
    };
  });
}

// Endpoint para obter dados de envios por estado
router.get('/envios-por-estado/:periodo', (req, res) => {
  const periodo = req.params.periodo as string;
  
  if (!['daily', 'weekly', 'monthly', 'yearly'].includes(periodo)) {
    return res.status(400).json({ error: 'Período inválido. Use daily, weekly, monthly ou yearly.' });
  }
  
  // Gerar dados baseados no período
  const dados = gerarDadosEnviosPorEstado(periodo);
  
  res.json(dados);
});

// Endpoint para obter estatísticas gerais
router.get('/estatisticas/:periodo', (req, res) => {
  const periodo = req.params.periodo as string;
  
  if (!['daily', 'weekly', 'monthly', 'yearly'].includes(periodo)) {
    return res.status(400).json({ error: 'Período inválido. Use daily, weekly, monthly ou yearly.' });
  }
  
  // Fator de multiplicação de acordo com o período
  const fatorPeriodo = {
    'daily': 1,
    'weekly': 7,
    'monthly': 30,
    'yearly': 365
  }[periodo] || 1;
  
  // Adicionar variação aleatória para cada período
  const variacao = Math.random() * 0.2 - 0.1; // Variação de -10% a +10%
  
  // Dados de exemplo com alguma variação baseada no período
  const dados = {
    totalEnvios: Math.round(580 * fatorPeriodo * (1 + variacao)),
    enviosPorStatus: {
      emTransito: Math.round(320 * fatorPeriodo * (1 + variacao)),
      entregues: Math.round(180 * fatorPeriodo * (1 + variacao)),
      atrasados: Math.round(45 * fatorPeriodo * (1 + variacao)),
      problemas: Math.round(35 * fatorPeriodo * (1 + variacao))
    },
    mediaTempo: {
      preparacao: Math.round(45 + Math.random() * 15 - 7.5), // 45 min ± 7.5 min
      transporte: Math.round(72 + Math.random() * 24 - 12), // 72 horas ± 12 horas
      entrega: Math.round(24 + Math.random() * 8 - 4) // 24 horas ± 4 horas
    },
    custoMedio: {
      valor: Math.round(15500 + Math.random() * 3000 - 1500) / 100, // R$ 155,00 ± R$ 15,00
      variacao: Math.round((Math.random() * 10 - 5) * 10) / 10 // Variação de -5% a +5% com uma casa decimal
    }
  };
  
  res.json(dados);
});

// Rota para obter dados detalhados de um estado específico (para o tooltip)
router.get('/detalhe-estado/:sigla/:periodo', (req, res) => {
  const { sigla, periodo } = req.params;
  
  if (!Object.keys(estadosData).includes(sigla)) {
    return res.status(404).json({ error: 'Estado não encontrado' });
  }
  
  if (!['daily', 'weekly', 'monthly', 'yearly'].includes(periodo)) {
    return res.status(400).json({ error: 'Período inválido. Use daily, weekly, monthly ou yearly.' });
  }
  
  // Fator de multiplicação baseado no período
  const fatorPeriodo = {
    'daily': 1,
    'weekly': 7,
    'monthly': 30,
    'yearly': 365
  }[periodo] || 1;
  
  // Obter valor base para o estado
  const dadosBase = gerarDadosEnviosPorEstado(periodo).find(item => item.id === sigla);
  const valorBase = dadosBase?.value || 10;
  
  // Gerar detalhes fictícios
  const detalhes = {
    estado: estadosData[sigla],
    sigla,
    totalEnvios: valorBase,
    detalhamento: {
      medicamentos: Math.round(valorBase * 0.65), // 65% medicamentos
      suplementos: Math.round(valorBase * 0.25), // 25% suplementos
      outros: Math.round(valorBase * 0.1) // 10% outros
    },
    percentualTotal: Math.round((valorBase / (580 * fatorPeriodo)) * 1000) / 10, // Percentual com uma casa decimal
    cidadesPrincipais: gerarCidadesPrincipais(sigla, valorBase)
  };
  
  res.json(detalhes);
});

// Função auxiliar para gerar dados de cidades principais por estado
function gerarCidadesPrincipais(siglaEstado: string, totalEnvios: number) {
  // Mapeamento de estados para suas principais cidades (simplificado)
  const cidadesPorEstado = {
    'SP': ['São Paulo', 'Campinas', 'Ribeirão Preto', 'Santos', 'São José dos Campos'],
    'RJ': ['Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'Nova Iguaçu', 'Petrópolis'],
    'MG': ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora', 'Contagem', 'Betim'],
    'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria'],
    'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel'],
    'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Criciúma'],
    'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna'],
    'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina'],
    'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral'],
    'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia'],
    'DF': ['Brasília', 'Taguatinga', 'Ceilândia', 'Gama', 'Sobradinho'],
    // Dados para os demais estados...
    'DEFAULT': ['Cidade Principal', 'Segunda Cidade', 'Terceira Cidade']
  };
  
  // Obter lista de cidades para o estado ou usar lista padrão
  const cidades = cidadesPorEstado[siglaEstado] || cidadesPorEstado['DEFAULT'];
  
  // Distribuir os envios entre as cidades (60% para a capital, resto distribuído)
  const cidadesComValores = cidades.map((cidade, index) => {
    let percentual;
    if (index === 0) {
      // Primeira cidade (capital) com 60%
      percentual = 0.6;
    } else {
      // Distribuir o restante (40%) entre as outras cidades
      percentual = 0.4 / (cidades.length - 1);
    }
    
    return {
      cidade,
      envios: Math.round(totalEnvios * percentual)
    };
  });
  
  return cidadesComValores;
}

export default router;