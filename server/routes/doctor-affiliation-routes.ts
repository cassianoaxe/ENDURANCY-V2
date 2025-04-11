import { Express, Request, Response } from 'express';
import { db } from '../db';
import crypto from 'crypto';
import { eq, and, not, isNull } from 'drizzle-orm';
import { 
  doctorOrganizationsTable, 
  usersTable, 
  organizationsTable,
  insertDoctorOrganizationSchema
} from '@shared/schema-doctor-affiliation';
import { sendTemplateEmail, EmailTemplate } from '../email';

// Interface para dados do convite
interface InviteData {
  email: string;
  name: string;
  specialty: string;
  crm: string;
  crmState: string;
  message?: string;
}

/**
 * Envia email de convite para afiliação
 */
async function sendInviteEmail(inviteData: {
  email: string;
  name: string;
  organizationName: string;
  inviteToken: string;
  message?: string;
}) {
  try {
    const { email, name, organizationName, inviteToken, message } = inviteData;
    
    // URL para aceitar o convite
    const acceptUrl = `${process.env.APP_URL || 'http://localhost:5000'}/doctor/invitation/${inviteToken}/accept`;
    const declineUrl = `${process.env.APP_URL || 'http://localhost:5000'}/doctor/invitation/${inviteToken}/decline`;
    
    // Enviar email usando o sistema de templates existente
    await sendTemplateEmail(
      email,
      `Convite para afiliação com ${organizationName}`,
      'doctor_affiliation_invite' as EmailTemplate,
      {
        doctorName: name,
        organizationName,
        acceptUrl,
        declineUrl,
        message: message || 'Gostaríamos de convidar você para fazer parte da nossa rede de médicos afiliados.',
        expiryDays: 7  // Convite expira em 7 dias
      }
    );
    
    return true;
  } catch (error) {
    console.error('Erro ao enviar email de convite:', error);
    return false;
  }
}

/**
 * Registra as rotas de afiliação de médicos
 */
export function registerDoctorAffiliationRoutes(app: Express) {
  
  // Rota para enviar convite de afiliação 
  app.post('/api/organization/doctor-management/affiliation/invite', async (req: Request, res: Response) => {
    try {
      // Verificar autenticação e permissões do usuário
      if (!req.session.user || !['admin', 'org_admin'].includes(req.session.user.role)) {
        return res.status(403).json({ message: 'Sem permissão para enviar convites' });
      }
      
      const organizationId = req.session.user.role === 'admin' 
        ? req.body.organizationId 
        : req.session.user.organizationId;
      
      if (!organizationId) {
        return res.status(400).json({ message: 'ID da organização é obrigatório' });
      }
      
      const inviteData: InviteData = req.body;
      
      // Verificar se já existe um convite pendente para este email
      const existingInvite = await db.select()
        .from(doctorOrganizationsTable)
        .where(
          and(
            eq(doctorOrganizationsTable.email, inviteData.email),
            eq(doctorOrganizationsTable.organizationId, organizationId),
            eq(doctorOrganizationsTable.status, 'pending')
          )
        );
      
      if (existingInvite.length > 0) {
        return res.status(409).json({ 
          message: 'Já existe um convite pendente para este médico' 
        });
      }
      
      // Buscar informações da organização
      const [organization] = await db.select()
        .from(organizationsTable)
        .where(eq(organizationsTable.id, organizationId));
      
      if (!organization) {
        return res.status(404).json({ message: 'Organização não encontrada' });
      }
      
      // Criar token único para o convite
      const inviteToken = crypto.randomBytes(32).toString('hex');
      
      // Data de expiração (7 dias)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      
      // Inserir convite no banco de dados
      const [invitation] = await db.insert(doctorOrganizationsTable)
        .values({
          email: inviteData.email,
          name: inviteData.name,
          specialty: inviteData.specialty,
          crm: inviteData.crm,
          crmState: inviteData.crmState,
          organizationId,
          status: 'pending',
          inviteToken,
          expiresAt: expiryDate
        })
        .returning();
      
      // Enviar email de convite
      const emailSent = await sendInviteEmail({
        email: inviteData.email,
        name: inviteData.name,
        organizationName: organization.name,
        inviteToken,
        message: inviteData.message
      });
      
      if (!emailSent) {
        // Mesmo com falha no email, registramos o convite mas retornamos alerta
        return res.status(200).json({ 
          success: true, 
          warning: 'Convite criado, mas houve um problema ao enviar o email',
          invitation
        });
      }
      
      return res.status(201).json({ 
        success: true, 
        message: 'Convite enviado com sucesso',
        invitation
      });
      
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      return res.status(500).json({ 
        message: 'Erro ao processar convite de afiliação' 
      });
    }
  });

  // Rota para listar convites de afiliação
  app.get('/api/organization/doctor-management/affiliation/invites', async (req: Request, res: Response) => {
    try {
      // Verificar autenticação e permissões do usuário
      if (!req.session.user || !['admin', 'org_admin'].includes(req.session.user.role)) {
        return res.status(403).json({ message: 'Sem permissão para visualizar convites' });
      }
      
      const organizationId = req.session.user.role === 'admin' 
        ? req.query.organizationId 
        : req.session.user.organizationId;
      
      if (!organizationId) {
        return res.status(400).json({ message: 'ID da organização é obrigatório' });
      }
      
      // Buscar convites da organização
      const invites = await db.select({
        id: doctorOrganizationsTable.id,
        doctorName: doctorOrganizationsTable.name,
        doctorEmail: doctorOrganizationsTable.email,
        specialty: doctorOrganizationsTable.specialty,
        crm: doctorOrganizationsTable.crm,
        crmState: doctorOrganizationsTable.crmState,
        status: doctorOrganizationsTable.status,
        createdAt: doctorOrganizationsTable.createdAt,
        expiresAt: doctorOrganizationsTable.expiresAt,
        respondedAt: doctorOrganizationsTable.respondedAt
      })
      .from(doctorOrganizationsTable)
      .where(
        and(
          eq(doctorOrganizationsTable.organizationId, Number(organizationId)),
          eq(doctorOrganizationsTable.doctorId, null) // Só mostra convites não aceitos ainda
        )
      );
      
      return res.status(200).json(invites);
      
    } catch (error) {
      console.error('Erro ao listar convites:', error);
      return res.status(500).json({ 
        message: 'Erro ao buscar convites de afiliação' 
      });
    }
  });

  // Rota para cancelar um convite
  app.post('/api/organization/doctor-management/affiliation/invite/:id/cancel', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Verificar autenticação e permissões do usuário
      if (!req.session.user || !['admin', 'org_admin'].includes(req.session.user.role)) {
        return res.status(403).json({ message: 'Sem permissão para cancelar convites' });
      }
      
      const organizationId = req.session.user.organizationId;
      
      // Buscar convite
      const [invite] = await db.select()
        .from(doctorOrganizationsTable)
        .where(
          and(
            eq(doctorOrganizationsTable.id, Number(id)),
            req.session.user.role !== 'admin' ? eq(doctorOrganizationsTable.organizationId, organizationId) : undefined
          )
        );
      
      if (!invite) {
        return res.status(404).json({ message: 'Convite não encontrado' });
      }
      
      if (invite.status !== 'pending') {
        return res.status(400).json({ message: 'Apenas convites pendentes podem ser cancelados' });
      }
      
      // Atualizar status do convite
      const [updatedInvite] = await db.update(doctorOrganizationsTable)
        .set({ 
          status: 'cancelled',
          respondedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(doctorOrganizationsTable.id, Number(id)))
        .returning();
      
      return res.status(200).json({ 
        success: true, 
        message: 'Convite cancelado com sucesso',
        invitation: updatedInvite
      });
      
    } catch (error) {
      console.error('Erro ao cancelar convite:', error);
      return res.status(500).json({ 
        message: 'Erro ao cancelar convite de afiliação' 
      });
    }
  });

  // Rota para reenviar um convite
  app.post('/api/organization/doctor-management/affiliation/invite/:id/resend', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Verificar autenticação e permissões do usuário
      if (!req.session.user || !['admin', 'org_admin'].includes(req.session.user.role)) {
        return res.status(403).json({ message: 'Sem permissão para reenviar convites' });
      }
      
      const organizationId = req.session.user.organizationId;
      
      // Buscar convite
      const [invite] = await db.select()
        .from(doctorOrganizationsTable)
        .where(
          and(
            eq(doctorOrganizationsTable.id, Number(id)),
            req.session.user.role !== 'admin' ? eq(doctorOrganizationsTable.organizationId, organizationId) : undefined
          )
        );
      
      if (!invite) {
        return res.status(404).json({ message: 'Convite não encontrado' });
      }
      
      // Criar novo token e atualizar data de expiração
      const newToken = crypto.randomBytes(32).toString('hex');
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      
      // Atualizar convite
      const [updatedInvite] = await db.update(doctorOrganizationsTable)
        .set({ 
          status: 'pending',
          inviteToken: newToken,
          expiresAt: expiryDate,
          updatedAt: new Date()
        })
        .where(eq(doctorOrganizationsTable.id, Number(id)))
        .returning();
      
      // Buscar informações da organização
      const [organization] = await db.select()
        .from(organizationsTable)
        .where(eq(organizationsTable.id, invite.organizationId));
      
      // Reenviar email de convite
      const emailSent = await sendInviteEmail({
        email: invite.email,
        name: invite.name,
        organizationName: organization.name,
        inviteToken: newToken,
        message: req.body.message
      });
      
      if (!emailSent) {
        return res.status(200).json({ 
          success: true, 
          warning: 'Convite atualizado, mas houve um problema ao reenviar o email',
          invitation: updatedInvite
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Convite reenviado com sucesso',
        invitation: updatedInvite
      });
      
    } catch (error) {
      console.error('Erro ao reenviar convite:', error);
      return res.status(500).json({ 
        message: 'Erro ao reenviar convite de afiliação' 
      });
    }
  });

  // Rota para aceitar um convite (acessada pelo médico através do link no email)
  app.post('/api/doctor/affiliation/accept/:token', async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      // Verificar autenticação do usuário
      if (!req.session.user) {
        return res.status(401).json({ message: 'Você precisa estar autenticado para aceitar um convite' });
      }
      
      // Verificar se o usuário é médico
      if (req.session.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Apenas médicos podem aceitar convites de afiliação' });
      }
      
      // Buscar convite pelo token
      const [invite] = await db.select()
        .from(doctorOrganizationsTable)
        .where(eq(doctorOrganizationsTable.inviteToken, token));
      
      if (!invite) {
        return res.status(404).json({ message: 'Convite não encontrado' });
      }
      
      // Verificar se o convite expirou
      if (invite.expiresAt && new Date() > new Date(invite.expiresAt)) {
        return res.status(400).json({ message: 'Este convite expirou' });
      }
      
      // Verificar se o convite já foi respondido
      if (invite.status !== 'pending') {
        return res.status(400).json({ message: 'Este convite já foi respondido ou cancelado' });
      }
      
      // Verificar se o email do convite corresponde ao do usuário logado
      if (invite.email !== req.session.user.email) {
        return res.status(403).json({ message: 'Este convite não foi enviado para o seu email' });
      }
      
      // Atualizar convite para aceito e vincular ao médico
      const [updatedInvite] = await db.update(doctorOrganizationsTable)
        .set({ 
          status: 'active',
          doctorId: req.session.user.id,
          respondedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(doctorOrganizationsTable.id, invite.id))
        .returning();
      
      // Buscar informações da organização
      const [organization] = await db.select()
        .from(organizationsTable)
        .where(eq(organizationsTable.id, invite.organizationId));
      
      return res.status(200).json({ 
        success: true, 
        message: `Afiliação com ${organization.name} aceita com sucesso`,
        affiliation: updatedInvite
      });
      
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      return res.status(500).json({ 
        message: 'Erro ao aceitar convite de afiliação' 
      });
    }
  });

  // Rota para recusar um convite (acessada pelo médico através do link no email)
  app.post('/api/doctor/affiliation/decline/:token', async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      // Verificar autenticação do usuário
      if (!req.session.user) {
        return res.status(401).json({ message: 'Você precisa estar autenticado para recusar um convite' });
      }
      
      // Verificar se o usuário é médico
      if (req.session.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Apenas médicos podem recusar convites de afiliação' });
      }
      
      // Buscar convite pelo token
      const [invite] = await db.select()
        .from(doctorOrganizationsTable)
        .where(eq(doctorOrganizationsTable.inviteToken, token));
      
      if (!invite) {
        return res.status(404).json({ message: 'Convite não encontrado' });
      }
      
      // Verificar se o convite expirou
      if (invite.expiresAt && new Date() > new Date(invite.expiresAt)) {
        return res.status(400).json({ message: 'Este convite expirou' });
      }
      
      // Verificar se o convite já foi respondido
      if (invite.status !== 'pending') {
        return res.status(400).json({ message: 'Este convite já foi respondido ou cancelado' });
      }
      
      // Verificar se o email do convite corresponde ao do usuário logado
      if (invite.email !== req.session.user.email) {
        return res.status(403).json({ message: 'Este convite não foi enviado para o seu email' });
      }
      
      // Atualizar convite para recusado
      const [updatedInvite] = await db.update(doctorOrganizationsTable)
        .set({ 
          status: 'denied',
          respondedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(doctorOrganizationsTable.id, invite.id))
        .returning();
      
      // Buscar informações da organização
      const [organization] = await db.select()
        .from(organizationsTable)
        .where(eq(organizationsTable.id, invite.organizationId));
      
      return res.status(200).json({ 
        success: true, 
        message: `Convite de ${organization.name} recusado com sucesso`,
        invitation: updatedInvite
      });
      
    } catch (error) {
      console.error('Erro ao recusar convite:', error);
      return res.status(500).json({ 
        message: 'Erro ao recusar convite de afiliação' 
      });
    }
  });

  // Rota para médicos listarem suas afiliações ativas
  app.get('/api/doctor/affiliations', async (req: Request, res: Response) => {
    try {
      // Verificar autenticação do usuário
      if (!req.session.user) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Verificar se o usuário é médico
      if (req.session.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Esta rota é exclusiva para médicos' });
      }
      
      // Buscar afiliações do médico
      const affiliations = await db.select({
        id: doctorOrganizationsTable.id,
        organizationId: doctorOrganizationsTable.organizationId,
        organizationName: organizationsTable.name, 
        organizationLogo: organizationsTable.logoUrl,
        organizationType: organizationsTable.type,
        status: doctorOrganizationsTable.status,
        isDefault: doctorOrganizationsTable.isDefault,
        createdAt: doctorOrganizationsTable.createdAt
      })
      .from(doctorOrganizationsTable)
      .leftJoin(
        organizationsTable, 
        eq(doctorOrganizationsTable.organizationId, organizationsTable.id)
      )
      .where(
        and(
          eq(doctorOrganizationsTable.doctorId, req.session.user.id),
          eq(doctorOrganizationsTable.status, 'active')
        )
      );
      
      return res.status(200).json(affiliations);
      
    } catch (error) {
      console.error('Erro ao listar afiliações do médico:', error);
      return res.status(500).json({ 
        message: 'Erro ao buscar afiliações' 
      });
    }
  });

  // Rota para médicos listarem seus convites pendentes
  app.get('/api/doctor/affiliation/invites', async (req: Request, res: Response) => {
    try {
      // Verificar autenticação do usuário
      if (!req.session.user) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Verificar se o usuário é médico
      if (req.session.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Esta rota é exclusiva para médicos' });
      }
      
      // Buscar convites pendentes para o email do médico
      const invites = await db.select({
        id: doctorOrganizationsTable.id,
        inviteToken: doctorOrganizationsTable.inviteToken,
        createdAt: doctorOrganizationsTable.createdAt,
        expiresAt: doctorOrganizationsTable.expiresAt,
        organizationName: organizationsTable.name,
        organizationLogo: organizationsTable.logoUrl,
        organizationType: organizationsTable.type
      })
      .from(doctorOrganizationsTable)
      .leftJoin(
        organizationsTable, 
        eq(doctorOrganizationsTable.organizationId, organizationsTable.id)
      )
      .where(
        and(
          eq(doctorOrganizationsTable.email, req.session.user.email),
          eq(doctorOrganizationsTable.status, 'pending'),
          isNull(doctorOrganizationsTable.doctorId)
        )
      );
      
      return res.status(200).json(invites);
      
    } catch (error) {
      console.error('Erro ao listar convites pendentes:', error);
      return res.status(500).json({ 
        message: 'Erro ao buscar convites pendentes' 
      });
    }
  });

  // Rota para médico deixar uma organização
  app.post('/api/doctor/affiliation/:organizationId/leave', async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.params;
      
      // Verificar autenticação do usuário
      if (!req.session.user) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Verificar se o usuário é médico
      if (req.session.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Esta rota é exclusiva para médicos' });
      }
      
      // Buscar afiliação
      const [affiliation] = await db.select()
        .from(doctorOrganizationsTable)
        .where(
          and(
            eq(doctorOrganizationsTable.doctorId, req.session.user.id),
            eq(doctorOrganizationsTable.organizationId, Number(organizationId)),
            eq(doctorOrganizationsTable.status, 'active')
          )
        );
      
      if (!affiliation) {
        return res.status(404).json({ message: 'Afiliação não encontrada' });
      }
      
      // Atualizar afiliação para "saiu"
      const [updatedAffiliation] = await db.update(doctorOrganizationsTable)
        .set({ 
          status: 'left',
          respondedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(doctorOrganizationsTable.id, affiliation.id))
        .returning();
      
      return res.status(200).json({ 
        success: true, 
        message: 'Você deixou esta organização com sucesso',
        affiliation: updatedAffiliation
      });
      
    } catch (error) {
      console.error('Erro ao deixar organização:', error);
      return res.status(500).json({ 
        message: 'Erro ao deixar organização' 
      });
    }
  });

  // Rota para organizações listarem médicos afiliados
  app.get('/api/organization/doctor-management/affiliation/doctors', async (req: Request, res: Response) => {
    try {
      // Verificar autenticação e permissões do usuário
      if (!req.session.user || !['admin', 'org_admin'].includes(req.session.user.role)) {
        return res.status(403).json({ message: 'Sem permissão para visualizar médicos afiliados' });
      }
      
      const organizationId = req.session.user.role === 'admin' 
        ? req.query.organizationId 
        : req.session.user.organizationId;
      
      if (!organizationId) {
        return res.status(400).json({ message: 'ID da organização é obrigatório' });
      }
      
      // Buscar médicos afiliados
      const affiliatedDoctors = await db.select({
        id: doctorOrganizationsTable.id,
        doctorId: doctorOrganizationsTable.doctorId,
        name: usersTable.name,
        email: usersTable.email,
        profilePhoto: usersTable.profilePhoto,
        specialty: doctorOrganizationsTable.specialty,
        crm: doctorOrganizationsTable.crm,
        crmState: doctorOrganizationsTable.crmState,
        status: doctorOrganizationsTable.status,
        affiliatedSince: doctorOrganizationsTable.createdAt
      })
      .from(doctorOrganizationsTable)
      .leftJoin(
        usersTable, 
        eq(doctorOrganizationsTable.doctorId, usersTable.id)
      )
      .where(
        and(
          eq(doctorOrganizationsTable.organizationId, Number(organizationId)),
          eq(doctorOrganizationsTable.status, 'active'),
          not(isNull(doctorOrganizationsTable.doctorId))
        )
      );
      
      return res.status(200).json(affiliatedDoctors);
      
    } catch (error) {
      console.error('Erro ao listar médicos afiliados:', error);
      return res.status(500).json({ 
        message: 'Erro ao buscar médicos afiliados' 
      });
    }
  });

  // Rota para remover um médico da organização
  app.post('/api/organization/doctor-management/affiliation/doctors/:id/remove', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Verificar autenticação e permissões do usuário
      if (!req.session.user || !['admin', 'org_admin'].includes(req.session.user.role)) {
        return res.status(403).json({ message: 'Sem permissão para remover médicos afiliados' });
      }
      
      const organizationId = req.session.user.organizationId;
      
      // Buscar afiliação
      const [affiliation] = await db.select()
        .from(doctorOrganizationsTable)
        .where(
          and(
            eq(doctorOrganizationsTable.id, Number(id)),
            req.session.user.role !== 'admin' ? eq(doctorOrganizationsTable.organizationId, organizationId) : undefined,
            eq(doctorOrganizationsTable.status, 'active')
          )
        );
      
      if (!affiliation) {
        return res.status(404).json({ message: 'Afiliação não encontrada' });
      }
      
      // Atualizar afiliação para "removido"
      const [updatedAffiliation] = await db.update(doctorOrganizationsTable)
        .set({ 
          status: 'removed',
          respondedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(doctorOrganizationsTable.id, Number(id)))
        .returning();
      
      return res.status(200).json({ 
        success: true, 
        message: 'Médico removido com sucesso',
        affiliation: updatedAffiliation
      });
      
    } catch (error) {
      console.error('Erro ao remover médico:', error);
      return res.status(500).json({ 
        message: 'Erro ao remover médico da organização' 
      });
    }
  });
}