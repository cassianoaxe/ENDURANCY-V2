import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { asc, desc, eq, and } from 'drizzle-orm';
import { socialBeneficios, socialBeneficios_Beneficiarios, insertSocialBeneficioSchema, insertSocialBeneficio_BeneficiarioSchema } from '@shared/schema-social';
import { users } from '@shared/schema';

export const socialBeneficiosRouter = Router();

// Rota para listar todos os benefícios disponíveis
socialBeneficiosRouter.get('/', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    const organizationId = req.user.organizationId;
    if (!organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    const beneficios = await db
      .select()
      .from(socialBeneficios)
      .where(eq(socialBeneficios.organizationId, organizationId))
      .orderBy(asc(socialBeneficios.nome));

    return res.status(200).json(beneficios);
  } catch (error) {
    console.error('Erro ao listar benefícios:', error);
    return res.status(500).json({ 
      message: 'Erro ao processar a solicitação',
      error: error.message
    });
  }
});

// Rota para obter detalhes de um benefício específico
socialBeneficiosRouter.get('/:id', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    if (!id || !organizationId) {
      return res.status(400).json({ message: 'Parâmetros inválidos' });
    }

    const [beneficio] = await db
      .select()
      .from(socialBeneficios)
      .where(
        and(
          eq(socialBeneficios.id, parseInt(id)),
          eq(socialBeneficios.organizationId, organizationId)
        )
      );

    if (!beneficio) {
      return res.status(404).json({ message: 'Benefício não encontrado' });
    }

    return res.status(200).json(beneficio);
  } catch (error) {
    console.error('Erro ao buscar detalhes do benefício:', error);
    return res.status(500).json({ 
      message: 'Erro ao processar a solicitação',
      error: error.message
    });
  }
});

// Rota para criar um novo benefício
socialBeneficiosRouter.post('/', async (req, res) => {
  try {
    if (!req.isAuthenticated() || req.user.role !== 'org_admin') {
      return res.status(403).json({ message: 'Permissão negada' });
    }

    const organizationId = req.user.organizationId;
    if (!organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    // Validar os dados de entrada
    const validationResult = insertSocialBeneficioSchema.safeParse({
      ...req.body,
      organizationId
    });

    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos',
        errors: validationResult.error.format() 
      });
    }

    // Criar o benefício
    const [novoBeneficio] = await db
      .insert(socialBeneficios)
      .values(validationResult.data)
      .returning();

    return res.status(201).json(novoBeneficio);
  } catch (error) {
    console.error('Erro ao criar benefício:', error);
    return res.status(500).json({ 
      message: 'Erro ao processar a solicitação',
      error: error.message
    });
  }
});

// Rota para atualizar um benefício existente
socialBeneficiosRouter.put('/:id', async (req, res) => {
  try {
    if (!req.isAuthenticated() || req.user.role !== 'org_admin') {
      return res.status(403).json({ message: 'Permissão negada' });
    }

    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    if (!id || !organizationId) {
      return res.status(400).json({ message: 'Parâmetros inválidos' });
    }

    // Validar os dados de entrada
    const validationResult = insertSocialBeneficioSchema.partial().safeParse({
      ...req.body,
      organizationId
    });

    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos',
        errors: validationResult.error.format() 
      });
    }

    // Verificar se o benefício existe
    const [beneficioExistente] = await db
      .select()
      .from(socialBeneficios)
      .where(
        and(
          eq(socialBeneficios.id, parseInt(id)),
          eq(socialBeneficios.organizationId, organizationId)
        )
      );

    if (!beneficioExistente) {
      return res.status(404).json({ message: 'Benefício não encontrado' });
    }

    // Atualizar o benefício
    const [beneficioAtualizado] = await db
      .update(socialBeneficios)
      .set({
        ...validationResult.data,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(socialBeneficios.id, parseInt(id)),
          eq(socialBeneficios.organizationId, organizationId)
        )
      )
      .returning();

    return res.status(200).json(beneficioAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar benefício:', error);
    return res.status(500).json({ 
      message: 'Erro ao processar a solicitação',
      error: error.message
    });
  }
});

// Rota para pesquisar usuários por email ou cpf
socialBeneficiosRouter.post('/usuarios/pesquisar', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    const { tipo, valor } = req.body;
    
    if (!tipo || !valor || (tipo !== 'email' && tipo !== 'cpf')) {
      return res.status(400).json({ message: 'Parâmetros de pesquisa inválidos' });
    }

    let usuarioEncontrado;
    
    if (tipo === 'email') {
      const [usuario] = await db
        .select()
        .from(users)
        .where(eq(users.email, valor));
      
      usuarioEncontrado = usuario;
    } else {
      const [usuario] = await db
        .select()
        .from(users)
        .where(eq(users.cpf, valor));
      
      usuarioEncontrado = usuario;
    }

    if (!usuarioEncontrado) {
      return res.status(200).json({ 
        message: 'Usuário não encontrado',
        usuario: null
      });
    }

    // Verificar se o usuário já é um beneficiário
    const [beneficiarioExistente] = await db
      .select()
      .from(socialBeneficios_Beneficiarios)
      .where(eq(socialBeneficios_Beneficiarios.beneficiarioId, usuarioEncontrado.id));

    return res.status(200).json({
      usuario: {
        id: usuarioEncontrado.id,
        name: usuarioEncontrado.name,
        email: usuarioEncontrado.email,
        cpf: usuarioEncontrado.cpf,
        isBeneficiario: !!beneficiarioExistente
      }
    });
  } catch (error) {
    console.error('Erro ao pesquisar usuário:', error);
    return res.status(500).json({ 
      message: 'Erro ao processar a solicitação',
      error: error.message
    });
  }
});

// Rota para converter um usuário em beneficiário
socialBeneficiosRouter.post('/beneficiarios/converter', async (req, res) => {
  try {
    if (!req.isAuthenticated() || req.user.role !== 'org_admin') {
      return res.status(403).json({ message: 'Permissão negada' });
    }

    const organizationId = req.user.organizationId;
    if (!organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    const { usuarioId, beneficioId, recorrente, dataValidade, observacoes } = req.body;
    
    if (!usuarioId || !beneficioId) {
      return res.status(400).json({ message: 'Dados incompletos' });
    }

    // Verificar se o usuário existe
    const [usuario] = await db
      .select()
      .from(users)
      .where(eq(users.id, usuarioId));

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar se o benefício existe
    const [beneficio] = await db
      .select()
      .from(socialBeneficios)
      .where(
        and(
          eq(socialBeneficios.id, parseInt(beneficioId)),
          eq(socialBeneficios.organizationId, organizationId)
        )
      );

    if (!beneficio) {
      return res.status(404).json({ message: 'Benefício não encontrado' });
    }

    // Verificar se o usuário já recebe este benefício
    const [beneficioExistente] = await db
      .select()
      .from(socialBeneficios_Beneficiarios)
      .where(
        and(
          eq(socialBeneficios_Beneficiarios.beneficiarioId, usuarioId),
          eq(socialBeneficios_Beneficiarios.beneficioId, parseInt(beneficioId))
        )
      );

    if (beneficioExistente) {
      return res.status(400).json({ message: 'Usuário já recebe este benefício' });
    }

    // Criar o relacionamento entre beneficiário e benefício
    const dadosConcessao = {
      beneficiarioId: usuarioId,
      beneficioId: parseInt(beneficioId),
      organizationId,
      recorrente: !!recorrente,
      dataValidade: dataValidade ? new Date(dataValidade) : null,
      observacoes: observacoes || '',
      status: 'ativo',
    };

    const [novaConcessao] = await db
      .insert(socialBeneficios_Beneficiarios)
      .values(dadosConcessao)
      .returning();

    return res.status(201).json({
      message: 'Usuário convertido em beneficiário com sucesso',
      concessao: novaConcessao
    });
  } catch (error) {
    console.error('Erro ao converter usuário em beneficiário:', error);
    return res.status(500).json({ 
      message: 'Erro ao processar a solicitação',
      error: error.message
    });
  }
});

// Rota para listar benefícios de um beneficiário específico
socialBeneficiosRouter.get('/beneficiario/:id', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    if (!id || !organizationId) {
      return res.status(400).json({ message: 'Parâmetros inválidos' });
    }

    const beneficiosConcedidos = await db
      .select({
        concessao: socialBeneficios_Beneficiarios,
        beneficio: socialBeneficios
      })
      .from(socialBeneficios_Beneficiarios)
      .leftJoin(
        socialBeneficios,
        eq(socialBeneficios_Beneficiarios.beneficioId, socialBeneficios.id)
      )
      .where(
        and(
          eq(socialBeneficios_Beneficiarios.beneficiarioId, parseInt(id)),
          eq(socialBeneficios_Beneficiarios.organizationId, organizationId)
        )
      )
      .orderBy(desc(socialBeneficios_Beneficiarios.dataConcessao));

    return res.status(200).json(beneficiosConcedidos);
  } catch (error) {
    console.error('Erro ao listar benefícios do beneficiário:', error);
    return res.status(500).json({ 
      message: 'Erro ao processar a solicitação',
      error: error.message
    });
  }
});