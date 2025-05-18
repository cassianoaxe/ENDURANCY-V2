import { db } from './db';
import { sql } from 'drizzle-orm';

const exampleData = [
  {
    nome: 'João Silva',
    email: 'joao.silva@empresa.com.br',
    organizacao: 'Hospital São Lucas',
    tipo_organizacao: 'Hospital',
    telefone: '(11) 98765-4321',
    cargo: 'Diretor Médico',
    interesse: 'Módulos financeiro e gestão de ativos',
    comentarios: 'Gostaria de saber mais sobre integração com sistemas hospitalares',
    modulos: JSON.stringify(['financeiro', 'patrimonio']),
    aceita_termos: true,
    status: 'novo',
    observacoes: '',
    ip: '187.54.23.9',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  },
  {
    nome: 'Maria Oliveira',
    email: 'maria.oliveira@laboratorio.com.br',
    organizacao: 'Laboratório Análises Clínicas',
    tipo_organizacao: 'Laboratório',
    telefone: '(21) 99876-5432',
    cargo: 'Gerente de Qualidade',
    interesse: 'Gestão de laboratório e relatórios',
    comentarios: 'Buscando uma solução para gerenciamento de amostras biológicas',
    modulos: JSON.stringify(['laboratorio', 'pesquisa']),
    aceita_termos: true,
    status: 'contatado',
    observacoes: 'Cliente potencial para o módulo de gestão laboratorial. Agendar demonstração.',
    ip: '201.45.33.182',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    contatado_em: new Date().toISOString(),
  },
  {
    nome: 'Carlos Mendes',
    email: 'carlos.mendes@farmacia.com.br',
    organizacao: 'Rede de Farmácias Saúde',
    tipo_organizacao: 'Farmácia',
    telefone: '(51) 98123-4567',
    cargo: 'Diretor de Operações',
    interesse: 'Sistema completo para rede de farmácias',
    comentarios: 'Precisa de controle de estoque integrado com vendas',
    modulos: JSON.stringify(['vendas', 'estoque', 'financeiro']),
    aceita_termos: true,
    status: 'novo',
    observacoes: '',
    ip: '177.92.54.126',
    user_agent: 'Mozilla/5.0 (Linux; Android 11; SM-G970F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.105 Mobile Safari/537.36',
  },
  {
    nome: 'Ana Souza',
    email: 'ana.souza@pesquisa.edu.br',
    organizacao: 'Instituto de Pesquisas Biomédicas',
    tipo_organizacao: 'Centro de Pesquisa',
    telefone: '(41) 99765-8765',
    cargo: 'Pesquisadora Sênior',
    interesse: 'Módulo de pesquisa científica e gestão de dados',
    comentarios: 'Necessitamos de um sistema para gerenciar protocolos de pesquisa e amostras',
    modulos: JSON.stringify(['pesquisa', 'laboratorio']),
    aceita_termos: true,
    status: 'convertido',
    observacoes: 'Cliente convertido para o plano Premium. Implementação em andamento.',
    ip: '189.45.123.99',
    user_agent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0',
    contatado_em: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 dias atrás
    convertido_em: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
  },
  {
    nome: 'Roberto Almeida',
    email: 'roberto.almeida@clinica.med.br',
    organizacao: 'Clínica Saúde Integrada',
    tipo_organizacao: 'Clínica',
    telefone: '(31) 98888-7777',
    cargo: 'Administrador',
    interesse: 'Sistema de gestão para clínica médica de pequeno porte',
    comentarios: 'Buscando uma solução simples e eficiente para agendamento e prontuários',
    modulos: JSON.stringify(['agendamento', 'prontuario']),
    aceita_termos: true,
    status: 'descartado',
    observacoes: 'Cliente não tem orçamento no momento. Retomar contato em 6 meses.',
    ip: '200.178.45.77',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    contatado_em: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 dias atrás
  }
];

async function main() {
  console.log('Iniciando inserção de dados de exemplo para pré-cadastros');

  try {
    // Verificar se já existem dados
    const countResult = await db.execute(sql`SELECT COUNT(*) FROM pre_cadastros`);
    const currentCount = parseInt(countResult.rows[0].count);
    
    if (currentCount > 0) {
      console.log(`Já existem ${currentCount} pré-cadastros no banco de dados. Pulando inserção de dados de exemplo.`);
      return;
    }
    
    // Inserir dados de exemplo
    for (const cadastro of exampleData) {
      const result = await db.execute(sql`
        INSERT INTO pre_cadastros (
          nome, email, organizacao, tipo_organizacao, telefone, cargo,
          interesse, comentarios, modulos, aceita_termos, status,
          observacoes, ip, user_agent, contatado_em, convertido_em
        ) VALUES (
          ${cadastro.nome}, ${cadastro.email}, ${cadastro.organizacao},
          ${cadastro.tipo_organizacao}, ${cadastro.telefone}, ${cadastro.cargo},
          ${cadastro.interesse}, ${cadastro.comentarios}, ${cadastro.modulos}::jsonb,
          ${cadastro.aceita_termos}, ${cadastro.status}, ${cadastro.observacoes},
          ${cadastro.ip}, ${cadastro.user_agent}, 
          ${cadastro.contatado_em || null}, ${cadastro.convertido_em || null}
        )
      `);
      
      console.log(`Inserido pré-cadastro para: ${cadastro.nome}`);
    }

    console.log('Dados de exemplo para pré-cadastros inseridos com sucesso!');
  } catch (error) {
    console.error('Erro durante a inserção de dados de exemplo:', error);
    throw error;
  }
}

main()
  .then(() => {
    console.log('Seed concluído com sucesso');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Falha no seed:', error);
    process.exit(1);
  });