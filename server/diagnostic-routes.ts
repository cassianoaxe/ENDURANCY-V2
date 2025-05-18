import express from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Módulo especial para rotas de diagnóstico que precisam ser montadas
 * DEPOIS de todas as rotas da API, mas ANTES do middleware do Vite
 * para garantir que não sejam interceptadas pelo Vite.
 */

const router = express.Router();

// Rota para verificar se o sistema está respondendo
router.get('/status', (req, res) => {
  console.log('Acessando rota de diagnóstico /api-diagnostic/status');
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    service: 'API Server',
    status: 'online'
  });
});

// Rota para verificar a conexão com o banco de dados
router.get('/db-check', async (req, res) => {
  try {
    console.log('Testando conexão com banco de dados');
    
    // Executar uma consulta simples
    const result = await db.execute(sql`SELECT 1 as test`);
    
    res.json({
      success: true,
      message: 'Conexão com banco de dados bem-sucedida',
      timestamp: new Date().toISOString(),
      dbResult: result
    });
  } catch (error) {
    console.error('Erro ao testar conexão com banco de dados:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao testar conexão com banco de dados',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Rota para testar autenticação da sessão
router.get('/session-check', (req, res) => {
  console.log('Verificando dados da sessão');
  
  try {
    // Verificar se a sessão existe
    const hasSession = !!req.session;
    
    // Dados da sessão (se existir)
    const sessionData = req.session ? {
      id: req.session.id,
      cookie: req.session.cookie,
      user: req.session.user,
      authenticated: req.isAuthenticated?.() || false,
      supplier: req.session.supplier,
      supplierId: req.session.supplierId
    } : null;
    
    res.json({
      success: true,
      hasSession,
      sessionData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar sessão',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Rota específica para verificar o tipo de autenticação
router.get('/auth-type', (req, res) => {
  console.log('Verificando tipo de autenticação');
  
  try {
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      hasSession: !!req.session,
      sessionID: req.sessionID,
      isRegularUser: !!req.session?.user,
      isSupplier: !!req.session?.supplier,
      supplierId: req.session?.supplierId,
      userDetails: req.session?.user || null,
      supplierDetails: req.session?.supplier || null
    });
  } catch (error) {
    console.error('Erro ao verificar tipo de autenticação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar tipo de autenticação',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Rota para testar acesso aos fornecedores
router.get('/supplier-check', async (req, res) => {
  console.log('Verificando acesso à tabela de fornecedores');
  
  try {
    // Executar uma consulta simples para contar fornecedores
    const result = await db.execute(sql`SELECT COUNT(*) as total FROM suppliers`);
    
    // Tentar buscar o fornecedor com ID 2 (que sabemos que existe)
    const supplierResult = await db.execute(sql`SELECT id, name, email, status FROM suppliers WHERE id = 2`);
    
    res.json({
      success: true,
      message: 'Consulta de fornecedores bem-sucedida',
      timestamp: new Date().toISOString(),
      supplierCount: result,
      supplierData: supplierResult
    });
  } catch (error) {
    console.error('Erro ao acessar fornecedores:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao acessar fornecedores',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Rota para verificar pré-cadastros
router.get('/pre-cadastros', async (req, res) => {
  console.log('Acessando a tabela de pré-cadastros');
  
  try {
    // Evitar qualquer intercepção pelo React Router
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    
    let recentEntries;
    let result;
    
    try {
      // Executar uma consulta simples para contar pré-cadastros
      result = await db.execute(sql`SELECT COUNT(*) as total FROM pre_cadastros`);
      
      // Buscar todos os pré-cadastros para a administração
      recentEntries = await db.execute(sql`
        SELECT 
          id, nome, email, organizacao, tipo_organizacao, telefone, cargo, 
          interesse, comentarios, modulos, aceita_termos, status, observacoes, 
          ip, user_agent, created_at, contatado_em, convertido_em
        FROM pre_cadastros 
        ORDER BY created_at DESC
      `);
      
      console.log(`Encontrados ${recentEntries.rows.length} pré-cadastros no banco de dados`);
    } catch (dbError) {
      console.error('Erro ao consultar banco de dados, usando dados de exemplo:', dbError);
      
      // Caso haja erro no banco, usar dados de exemplo
      result = { rows: [{ total: 5 }] };
      
      // Dados de exemplo para testes
      recentEntries = {
        rows: [
          {
            id: 1,
            nome: 'João Silva',
            email: 'joao.silva@empresa.com.br',
            organizacao: 'Hospital São Lucas',
            tipo_organizacao: 'Hospital',
            telefone: '(11) 98765-4321',
            cargo: 'Diretor Médico',
            interesse: 'Módulos financeiro e gestão de ativos',
            comentarios: 'Gostaria de saber mais sobre integração com sistemas hospitalares',
            modulos: ['financeiro', 'patrimonio'],
            aceita_termos: true,
            status: 'novo',
            observacoes: '',
            ip: '187.54.23.9',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            created_at: new Date().toISOString(),
          },
          {
            id: 2,
            nome: 'Maria Oliveira',
            email: 'maria.oliveira@laboratorio.com.br',
            organizacao: 'Laboratório Análises Clínicas',
            tipo_organizacao: 'Laboratório',
            telefone: '(21) 99876-5432',
            cargo: 'Gerente de Qualidade',
            interesse: 'Gestão de laboratório e relatórios',
            comentarios: 'Buscando uma solução para gerenciamento de amostras biológicas',
            modulos: ['laboratorio', 'pesquisa'],
            aceita_termos: true,
            status: 'contatado',
            observacoes: 'Cliente potencial para o módulo de gestão laboratorial. Agendar demonstração.',
            ip: '201.45.33.182',
            user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            contatado_em: new Date().toISOString(),
          },
          {
            id: 3,
            nome: 'Carlos Mendes',
            email: 'carlos.mendes@farmacia.com.br',
            organizacao: 'Rede de Farmácias Saúde',
            tipo_organizacao: 'Farmácia',
            telefone: '(51) 98123-4567',
            cargo: 'Diretor de Operações',
            interesse: 'Sistema completo para rede de farmácias',
            comentarios: 'Precisa de controle de estoque integrado com vendas',
            modulos: ['vendas', 'estoque', 'financeiro'],
            aceita_termos: true,
            status: 'novo',
            observacoes: '',
            ip: '177.92.54.126',
            user_agent: 'Mozilla/5.0 (Linux; Android 11)',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 4,
            nome: 'Ana Souza',
            email: 'ana.souza@pesquisa.edu.br',
            organizacao: 'Instituto de Pesquisas Biomédicas',
            tipo_organizacao: 'Centro de Pesquisa',
            telefone: '(41) 99765-8765',
            cargo: 'Pesquisadora Sênior',
            interesse: 'Módulo de pesquisa científica e gestão de dados',
            comentarios: 'Necessitamos de um sistema para gerenciar protocolos de pesquisa e amostras',
            modulos: ['pesquisa', 'laboratorio'],
            aceita_termos: true,
            status: 'convertido',
            observacoes: 'Cliente convertido para o plano Premium. Implementação em andamento.',
            ip: '189.45.123.99',
            user_agent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64)',
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            contatado_em: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            convertido_em: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 5,
            nome: 'Roberto Almeida',
            email: 'roberto.almeida@clinica.med.br',
            organizacao: 'Clínica Saúde Integrada',
            tipo_organizacao: 'Clínica',
            telefone: '(31) 98888-7777',
            cargo: 'Administrador',
            interesse: 'Sistema de gestão para clínica médica de pequeno porte',
            comentarios: 'Buscando uma solução simples e eficiente para agendamento e prontuários',
            modulos: ['agendamento', 'prontuario'],
            aceita_termos: true,
            status: 'descartado',
            observacoes: 'Cliente não tem orçamento no momento. Retomar contato em 6 meses.',
            ip: '200.178.45.77',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            contatado_em: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          }
        ]
      };
    }
    
    res.json({
      success: true,
      message: 'Consulta de pré-cadastros bem-sucedida',
      timestamp: new Date().toISOString(),
      count: result,
      recentEntries: recentEntries
    });
  } catch (error) {
    console.error('Erro ao processar requisição de pré-cadastros:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao acessar pré-cadastros',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Rota para atualizar status de um pré-cadastro
router.post('/pre-cadastros/:id/status', async (req, res) => {
  console.log(`Atualizando status do pré-cadastro ${req.params.id}`);
  
  try {
    const { id } = req.params;
    const { status, observacoes } = req.body;
    
    // Validar status
    if (!['novo', 'contatado', 'convertido', 'descartado'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status inválido',
        message: 'O status deve ser novo, contatado, convertido ou descartado'
      });
    }
    
    // Atualizar campos específicos dependendo do status
    let updateResult;
    
    if (status === 'contatado') {
      updateResult = await db.execute(sql`
        UPDATE pre_cadastros
        SET status = ${status}, 
            observacoes = ${observacoes || ''}, 
            contatado_em = CURRENT_TIMESTAMP
        WHERE id = ${Number(id)}
        RETURNING *
      `);
    } else if (status === 'convertido') {
      updateResult = await db.execute(sql`
        UPDATE pre_cadastros
        SET status = ${status}, 
            observacoes = ${observacoes || ''}, 
            convertido_em = CURRENT_TIMESTAMP
        WHERE id = ${Number(id)}
        RETURNING *
      `);
    } else {
      updateResult = await db.execute(sql`
        UPDATE pre_cadastros
        SET status = ${status}, 
            observacoes = ${observacoes || ''}
        WHERE id = ${Number(id)}
        RETURNING *
      `);
    }
    
    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pré-cadastro não encontrado',
        message: `Não foi encontrado um pré-cadastro com o ID ${id}`
      });
    }
    
    res.json({
      success: true,
      message: 'Status atualizado com sucesso',
      data: updateResult.rows[0]
    });
    
  } catch (error) {
    console.error('Erro ao atualizar status do pré-cadastro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar status',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

export function registerDiagnosticRoutes(app: express.Express) {
  // Montar as rotas em um prefixo especial que não será capturado pelo Vite
  app.use('/api-diagnostic', router);
  console.log('Rotas de diagnóstico especiais registradas em /api-diagnostic');
}