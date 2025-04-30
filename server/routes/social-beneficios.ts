import { Router } from 'express';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import {
  socialBeneficios,
  socialBeneficios_Beneficiarios,
  insertSocialBeneficioSchema,
  socialBeneficiaries,
} from '@shared/schema-social';
import { users } from '@shared/schema';
import { z } from 'zod';

export const socialBeneficiosRouter = Router();

// Listar todos os benefícios disponíveis para uma organização
socialBeneficiosRouter.get('/', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const organizationId = req.user.organizationId;

    const beneficios = await db.select()
      .from(socialBeneficios)
      .where(eq(socialBeneficios.organizationId, organizationId));

    return res.status(200).json(beneficios);
  } catch (error) {
    console.error('Erro ao listar benefícios:', error);
    return res.status(500).json({ error: 'Erro ao listar benefícios' });
  }
});

// Obter detalhes de um benefício específico
socialBeneficiosRouter.get('/:id', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const organizationId = req.user.organizationId;
    const beneficioId = parseInt(req.params.id);

    const [beneficio] = await db.select()
      .from(socialBeneficios)
      .where(
        and(
          eq(socialBeneficios.id, beneficioId),
          eq(socialBeneficios.organizationId, organizationId)
        )
      );

    if (!beneficio) {
      return res.status(404).json({ error: 'Benefício não encontrado' });
    }

    return res.status(200).json(beneficio);
  } catch (error) {
    console.error('Erro ao obter detalhes do benefício:', error);
    return res.status(500).json({ error: 'Erro ao obter detalhes do benefício' });
  }
});

// Criar novo benefício
socialBeneficiosRouter.post('/', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const organizationId = req.user.organizationId;
    
    // Validar dados do benefício
    const beneficioData = insertSocialBeneficioSchema.parse({
      ...req.body,
      organizationId,
    });

    // Inserir benefício no banco de dados
    const [novoBeneficio] = await db.insert(socialBeneficios)
      .values(beneficioData)
      .returning();

    return res.status(201).json(novoBeneficio);
  } catch (error) {
    console.error('Erro ao criar benefício:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    
    return res.status(500).json({ error: 'Erro ao criar benefício' });
  }
});

// Atualizar benefício existente
socialBeneficiosRouter.put('/:id', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const organizationId = req.user.organizationId;
    const beneficioId = parseInt(req.params.id);
    
    // Verificar se o benefício existe e pertence à organização
    const [beneficioExistente] = await db.select()
      .from(socialBeneficios)
      .where(
        and(
          eq(socialBeneficios.id, beneficioId),
          eq(socialBeneficios.organizationId, organizationId)
        )
      );

    if (!beneficioExistente) {
      return res.status(404).json({ error: 'Benefício não encontrado' });
    }
    
    // Validar dados da atualização
    const beneficioData = insertSocialBeneficioSchema.parse({
      ...req.body,
      organizationId,
    });

    // Atualizar benefício
    const [beneficioAtualizado] = await db.update(socialBeneficios)
      .set({
        ...beneficioData,
        updatedAt: new Date(),
      })
      .where(eq(socialBeneficios.id, beneficioId))
      .returning();

    return res.status(200).json(beneficioAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar benefício:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    
    return res.status(500).json({ error: 'Erro ao atualizar benefício' });
  }
});

// Desativar benefício
socialBeneficiosRouter.delete('/:id', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const organizationId = req.user.organizationId;
    const beneficioId = parseInt(req.params.id);
    
    // Verificar se o benefício existe e pertence à organização
    const [beneficioExistente] = await db.select()
      .from(socialBeneficios)
      .where(
        and(
          eq(socialBeneficios.id, beneficioId),
          eq(socialBeneficios.organizationId, organizationId)
        )
      );

    if (!beneficioExistente) {
      return res.status(404).json({ error: 'Benefício não encontrado' });
    }
    
    // Desativar benefício (não excluir completamente)
    await db.update(socialBeneficios)
      .set({
        ativo: false,
        updatedAt: new Date(),
      })
      .where(eq(socialBeneficios.id, beneficioId));

    return res.status(200).json({ message: 'Benefício desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar benefício:', error);
    return res.status(500).json({ error: 'Erro ao desativar benefício' });
  }
});

// Pesquisar usuário por email ou CPF para conversão em beneficiário
socialBeneficiosRouter.post('/usuarios/pesquisar', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { tipo, valor } = req.body;
    
    if (!tipo || !valor) {
      return res.status(400).json({ error: 'Parâmetros de pesquisa inválidos' });
    }
    
    // Pesquisar usuário por email (único método disponível porque o schema users não tem o campo cpf)
    let usuario;
    if (tipo === 'email') {
      [usuario] = await db.select()
        .from(users)
        .where(eq(users.email, valor));
    } else {
      return res.status(400).json({ error: 'Tipo de pesquisa inválido. Apenas busca por email está disponível.' });
    }
    
    if (!usuario) {
      return res.status(200).json({ message: 'Usuário não encontrado', usuario: null });
    }
    
    // Verificar se o usuário já é um beneficiário através do email (já que o usuário não tem cpf no schema)
    const [beneficiarioExistente] = await db.select()
      .from(socialBeneficiaries)
      .where(eq(socialBeneficiaries.email, usuario.email));
    
    return res.status(200).json({
      usuario: {
        ...usuario,
        isBeneficiario: !!beneficiarioExistente
      }
    });
  } catch (error) {
    console.error('Erro ao pesquisar usuário:', error);
    return res.status(500).json({ error: 'Erro ao pesquisar usuário' });
  }
});

// Converter usuário em beneficiário e associar a um benefício
socialBeneficiosRouter.post('/beneficiarios/converter', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const organizationId = req.user.organizationId;
    const { usuarioId, beneficioId, recorrente, dataValidade, observacoes } = req.body;
    
    // Validar parâmetros
    if (!usuarioId || !beneficioId) {
      return res.status(400).json({ error: 'Parâmetros inválidos' });
    }
    
    // Buscar usuário
    const [usuario] = await db.select()
      .from(users)
      .where(eq(users.id, usuarioId));
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Buscar benefício
    const [beneficio] = await db.select()
      .from(socialBeneficios)
      .where(
        and(
          eq(socialBeneficios.id, beneficioId),
          eq(socialBeneficios.organizationId, organizationId)
        )
      );
    
    if (!beneficio) {
      return res.status(404).json({ error: 'Benefício não encontrado' });
    }
    
    // Verificar se o usuário já é um beneficiário pelo email
    let beneficiario;
    [beneficiario] = await db.select()
      .from(socialBeneficiaries)
      .where(eq(socialBeneficiaries.email, usuario.email));
    
    // Se não for, criar um novo beneficiário
    if (!beneficiario) {
      [beneficiario] = await db.insert(socialBeneficiaries)
        .values({
          organizationId,
          name: usuario.name,
          cpf: "", // Como o usuário não tem CPF, deixamos vazio
          birthDate: new Date(), // Data placeholder, será atualizada depois
          email: usuario.email,
          phone: usuario.phoneNumber || "",
          address: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
          status: "active",
        })
        .returning();
    }
    
    // Associar beneficiário ao benefício
    const [beneficioBeneficiario] = await db.insert(socialBeneficios_Beneficiarios)
      .values({
        beneficiarioId: beneficiario.id,
        beneficioId,
        organizationId,
        recorrente: recorrente || false,
        dataValidade: dataValidade ? new Date(dataValidade) : null,
        observacoes: observacoes || "",
        status: "ativo",
      })
      .returning();
    
    return res.status(201).json({
      message: 'Usuário convertido em beneficiário com sucesso',
      beneficiario,
      beneficioBeneficiario,
    });
  } catch (error) {
    console.error('Erro ao converter usuário em beneficiário:', error);
    return res.status(500).json({ error: 'Erro ao converter usuário em beneficiário' });
  }
});