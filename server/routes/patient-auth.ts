import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { db } from '../db';
import { users, organizations } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export const patientAuthRouter = Router();

// Esquema de validação para registro de paciente
const registerSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  organizationId: z.string().optional()
});

// Esquema de validação para login de paciente
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
  organizationId: z.string().optional()
});

/**
 * Rota para registro de pacientes
 */
patientAuthRouter.post('/api/auth/patient/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, organizationId } = registerSchema.parse(req.body);
    
    // Verificar se o email já está em uso
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Este email já está em uso. Por favor, escolha outro email.'
      });
    }
    
    // Verificar a organização (se fornecida)
    let orgId: number | null = null;
    
    if (organizationId) {
      try {
        // Verificar se a organização existe
        const org = await db.query.organizations.findFirst({
          where: eq(organizations.id, parseInt(organizationId)),
          columns: {
            id: true,
            status: true
          }
        });
        
        if (!org) {
          return res.status(400).json({
            success: false,
            message: 'Organização não encontrada.'
          });
        }
        
        if (org.status !== 'active') {
          return res.status(400).json({
            success: false,
            message: 'Esta organização não está ativa.'
          });
        }
        
        orgId = org.id;
      } catch (error) {
        console.error('Erro ao verificar organização:', error);
        return res.status(500).json({
          success: false,
          message: 'Erro ao verificar a organização.'
        });
      }
    }
    
    // Hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Gerar um nome de usuário único baseado no email (parte antes do @) e organização
    const usernameBase = email.split('@')[0].toLowerCase();
    const timestamp = Date.now().toString().slice(-4);
    const orgSuffix = orgId ? `-org${orgId}` : '';
    const username = `${usernameBase}${orgSuffix}_${timestamp}`;
    
    // Criar novo usuário vinculado à organização (se fornecida)
    const [newUser] = await db.insert(users).values({
      username,
      name,
      email,
      password: hashedPassword,
      role: 'patient',
      organizationId: orgId, // Vincular o paciente à organização
      createdAt: new Date()
    }).returning();
    
    // Responder com sucesso (sem incluir a senha)
    const { password: _, ...userWithoutPassword } = newUser;
    
    return res.status(201).json({
      success: true,
      message: 'Paciente registrado com sucesso',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao registrar paciente:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados de registro inválidos',
        errors: error.errors
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Erro ao registrar paciente. Por favor, tente novamente mais tarde.'
    });
  }
});

/**
 * Rota para login de pacientes
 */
patientAuthRouter.post('/api/auth/patient/login', async (req: Request, res: Response) => {
  try {
    const { email, password, organizationId } = loginSchema.parse(req.body);
    
    // Criar condições de busca base (email e papel de paciente)
    let conditions = and(
      eq(users.email, email),
      eq(users.role, 'patient')
    );
    
    // Adicionar condição de organização, se fornecida
    if (organizationId) {
      const orgId = parseInt(organizationId);
      if (!isNaN(orgId)) {
        conditions = and(
          conditions,
          eq(users.organizationId, orgId)
        );
      }
    }
    
    // Buscar o usuário com as condições
    const [user] = await db.select().from(users).where(conditions);
    
    // Verificar se o usuário existe
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos.'
      });
    }
    
    // Verificar a senha
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos.'
      });
    }
    
    // Criar a sessão do usuário
    if (req.session) {
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        organizationId: user.organizationId,
        createdAt: user.createdAt
      };
    }
    
    // Responder com sucesso (sem incluir a senha)
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao fazer login de paciente:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados de login inválidos',
        errors: error.errors
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Erro ao fazer login. Por favor, tente novamente mais tarde.'
    });
  }
});