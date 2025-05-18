import express, { Request } from 'express';
import { db } from './db';
import { preCadastros, insertPreCadastroSchema } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

// Router para gerenciamento de pré-cadastros
const router = express.Router();

// Rota para listar todos os pré-cadastros (apenas para administradores)
router.get('/', async (req: any, res) => {
  try {
    // Verificar se o usuário é admin - temporariamente desativado para testes
    // if (!req.isAuthenticated || !req.isAuthenticated() || !req.user || req.user.role !== 'admin') {
    //   return res.status(403).json({ message: 'Acesso negado' });
    // }

    console.log('Buscando pré-cadastros...');
    
    try {
      // Adicionando ordenação explícita em vez de usar a propriedade 'desc'
      const cadastros = await db
        .select()
        .from(preCadastros)
        .orderBy(desc(preCadastros.createdAt));
      
      console.log(`Encontrados ${cadastros.length} pré-cadastros`);
      
      // Forçar o Content-Type como application/json e prevenir MIME-type sniffing
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      return res.status(200).json(cadastros);
    } catch (dbError) {
      console.error('Erro no banco de dados:', dbError);
      return res.status(500).json({ message: 'Erro de banco de dados', error: String(dbError) });
    }
  } catch (error) {
    console.error('Erro ao buscar pré-cadastros:', error);
    return res.status(500).json({ message: 'Erro ao buscar pré-cadastros', error: String(error) });
  }
});

// Rota específica para verificar se API está funcionando
router.get('/check', (req, res) => {
  // Evitar qualquer intercepção pelo Vite ou pelo React Router
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Desabilitar cache para garantir resposta fresca
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  return res.status(200).json({ 
    status: 'ok', 
    message: 'API de pré-cadastros está funcionando', 
    timestamp: new Date().toISOString() 
  });
});

// Rota para salvar um novo pré-cadastro (pública)
router.post('/', async (req, res) => {
  try {
    // Validar dados usando o schema zod
    const result = insertPreCadastroSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: result.error.errors 
      });
    }

    // Adicionar informações de IP e User-Agent
    const cadastroData = {
      ...result.data,
      ip: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    };

    // Inserir no banco de dados
    const [novoCadastro] = await db.insert(preCadastros)
      .values([cadastroData as any]) // Correção do tipo para array
      .returning();

    console.log('Novo pré-cadastro recebido:', {
      id: novoCadastro.id,
      nome: novoCadastro.nome,
      email: novoCadastro.email,
      organizacao: novoCadastro.organizacao
    });

    return res.status(201).json({ 
      message: 'Pré-cadastro recebido com sucesso!',
      id: novoCadastro.id 
    });
  } catch (error) {
    console.error('Erro ao salvar pré-cadastro:', error);
    return res.status(500).json({ message: 'Erro ao processar pré-cadastro' });
  }
});

// Rota para atualizar o status de um pré-cadastro (admin)
router.patch('/:id', async (req: any, res) => {
  try {
    // Verificar se o usuário é admin
    if (!req.isAuthenticated || !req.isAuthenticated() || !req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const { id } = req.params;
    const { status, observacoes } = req.body;

    // Validar status
    if (!['novo', 'contatado', 'convertido', 'descartado'].includes(status)) {
      return res.status(400).json({ message: 'Status inválido' });
    }

    // Atualizar campos baseados no status
    let updateData: any = { status };
    
    if (observacoes) {
      updateData.observacoes = observacoes;
    }

    if (status === 'contatado') {
      updateData.contatadoEm = new Date();
    } else if (status === 'convertido') {
      updateData.convertidoEm = new Date();
      if (req.body.organizacaoId) {
        updateData.organizacaoId = req.body.organizacaoId;
      }
    }

    // Atualizar registro
    const [atualizado] = await db.update(preCadastros)
      .set(updateData)
      .where(eq(preCadastros.id, parseInt(id)))
      .returning();

    if (!atualizado) {
      return res.status(404).json({ message: 'Pré-cadastro não encontrado' });
    }

    return res.json(atualizado);
  } catch (error) {
    console.error('Erro ao atualizar pré-cadastro:', error);
    return res.status(500).json({ message: 'Erro ao atualizar pré-cadastro' });
  }
});

export default router;