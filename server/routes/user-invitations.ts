import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { userInvitations, users, userGroups } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { sendMail } from "../services/email";

export function registerUserInvitationsRoutes(app: any) {
  // Middleware para verificar se o usuário tem permissão para gerenciar convites
  const canManageInvitations = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    // Verifica se é admin ou se pertence à mesma organização do convite
    if (req.session.user.role === "admin") {
      return next();
    }

    // Se for um convite específico, verifica se pertence à organização do usuário
    const invitationId = parseInt(req.params.id);
    if (invitationId) {
      const [invitation] = await db
        .select()
        .from(userInvitations)
        .where(eq(userInvitations.id, invitationId));

      if (!invitation) {
        return res.status(404).json({ message: "Convite não encontrado" });
      }

      if (
        req.session.user.role === "org_admin" &&
        req.session.user.organizationId === invitation.organizationId
      ) {
        return next();
      }
    }

    return res.status(403).json({ message: "Acesso negado" });
  };

  // GET - Lista todos os convites (filtrado por organização)
  app.get("/api/user-invitations", async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.query;

      if (!req.session.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      // Apenas admins podem ver todos os convites, outros usuários veem só da sua organização
      let query = db.select()
        .from(userInvitations);

      if (req.session.user.role !== "admin" || organizationId) {
        const orgId = organizationId 
          ? parseInt(organizationId as string) 
          : req.session.user.organizationId;

        if (!orgId) {
          return res.status(400).json({ message: "ID da organização é necessário" });
        }

        query = query.where(eq(userInvitations.organizationId, orgId));
      }

      // Adiciona informações dos grupos
      const invitations = await query;

      // Enriquecer com informações de grupo se necessário
      for (const invitation of invitations) {
        if (invitation.groupId) {
          const [group] = await db
            .select()
            .from(userGroups)
            .where(eq(userGroups.id, invitation.groupId));
          
          if (group) {
            (invitation as any).groupName = group.name;
          }
        }
      }

      res.json(invitations);
    } catch (error) {
      console.error("Erro ao listar convites:", error);
      res.status(500).json({ message: "Erro ao listar convites" });
    }
  });

  // POST - Cria um novo convite
  app.post("/api/user-invitations", async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const { email, role, groupId, organizationId, invitedBy } = req.body;

      if (!email || !role || !organizationId) {
        return res.status(400).json({ message: "Email, role e organizationId são obrigatórios" });
      }

      // Verificar se já existe um usuário com este email
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (existingUser.length > 0) {
        return res.status(400).json({ message: "Já existe um usuário com este email" });
      }

      // Verificar se já existe um convite pendente para este email
      const existingInvitation = await db
        .select()
        .from(userInvitations)
        .where(
          and(
            eq(userInvitations.email, email),
            eq(userInvitations.status, "pending"),
            eq(userInvitations.organizationId, organizationId)
          )
        );

      if (existingInvitation.length > 0) {
        return res.status(400).json({ message: "Já existe um convite pendente para este email" });
      }

      // Verificar se a organização já possui usuários
      // Se não possuir, o primeiro usuário deve ser um administrador da organização (org_admin)
      const existingOrgUsers = await db
        .select()
        .from(users)
        .where(eq(users.organizationId, organizationId));

      if (existingOrgUsers.length === 0 && role !== "org_admin") {
        return res.status(400).json({ 
          message: "O primeiro usuário de uma organização deve ser um administrador (org_admin)"
        });
      }

      // Gerar token único para o convite
      const token = uuidv4();

      // Data de expiração (7 dias)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Criar novo convite
      const [newInvitation] = await db
        .insert(userInvitations)
        .values({
          email,
          role,
          groupId: groupId || null,
          organizationId,
          invitedBy,
          token,
          status: "pending",
          expiresAt: expiresAt.toISOString(),
          createdAt: new Date().toISOString(),
        })
        .returning();

      // Enviar email de convite
      try {
        await sendInvitationEmail(newInvitation);
      } catch (emailError) {
        console.error("Erro ao enviar email de convite:", emailError);
        // Continuar mesmo se o email falhar
      }

      res.status(201).json(newInvitation);
    } catch (error) {
      console.error("Erro ao criar convite:", error);
      res.status(500).json({ message: "Erro ao criar convite" });
    }
  });

  // POST - Reenvia um convite existente
  app.post("/api/user-invitations/:id/resend", canManageInvitations, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);

      const [invitation] = await db
        .select()
        .from(userInvitations)
        .where(eq(userInvitations.id, id));

      if (!invitation) {
        return res.status(404).json({ message: "Convite não encontrado" });
      }

      if (invitation.status !== "pending") {
        return res.status(400).json({ message: "Apenas convites pendentes podem ser reenviados" });
      }

      // Atualiza data de expiração
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const [updatedInvitation] = await db
        .update(userInvitations)
        .set({
          expiresAt: expiresAt.toISOString(),
        })
        .where(eq(userInvitations.id, id))
        .returning();

      // Reenvia o email
      try {
        await sendInvitationEmail(updatedInvitation);
      } catch (emailError) {
        console.error("Erro ao reenviar email de convite:", emailError);
        // Continuar mesmo se o email falhar
      }

      res.json(updatedInvitation);
    } catch (error) {
      console.error("Erro ao reenviar convite:", error);
      res.status(500).json({ message: "Erro ao reenviar convite" });
    }
  });

  // PUT - Cancela um convite
  app.put("/api/user-invitations/:id/cancel", canManageInvitations, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);

      const [invitation] = await db
        .select()
        .from(userInvitations)
        .where(eq(userInvitations.id, id));

      if (!invitation) {
        return res.status(404).json({ message: "Convite não encontrado" });
      }

      if (invitation.status !== "pending") {
        return res.status(400).json({ message: "Apenas convites pendentes podem ser cancelados" });
      }

      await db
        .update(userInvitations)
        .set({
          status: "expired",
        })
        .where(eq(userInvitations.id, id));

      res.json({ message: "Convite cancelado com sucesso" });
    } catch (error) {
      console.error("Erro ao cancelar convite:", error);
      res.status(500).json({ message: "Erro ao cancelar convite" });
    }
  });

  // POST - Aceita um convite (chamado pelo usuário convidado)
  app.post("/api/user-invitations/accept/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { name, password } = req.body;

      if (!token || !name || !password) {
        return res.status(400).json({ message: "Token, nome e senha são obrigatórios" });
      }

      // Busca o convite pelo token
      const [invitation] = await db
        .select()
        .from(userInvitations)
        .where(eq(userInvitations.token, token));

      if (!invitation) {
        return res.status(404).json({ message: "Convite não encontrado" });
      }

      if (invitation.status !== "pending") {
        return res.status(400).json({ message: "Este convite já foi utilizado ou expirou" });
      }

      // Verifica se o convite está expirado
      if (new Date(invitation.expiresAt) < new Date()) {
        await db
          .update(userInvitations)
          .set({ status: "expired" })
          .where(eq(userInvitations.id, invitation.id));
          
        return res.status(400).json({ message: "Este convite expirou" });
      }

      // Cria o novo usuário
      const [newUser] = await db
        .insert(users)
        .values({
          username: invitation.email,
          email: invitation.email,
          name,
          password, // Obs: Na implementação real, a senha deve ser hasheada
          role: invitation.role,
          organizationId: invitation.organizationId,
          createdAt: new Date().toISOString(),
        })
        .returning();

      // Atualiza o status do convite
      await db
        .update(userInvitations)
        .set({
          status: "accepted",
        })
        .where(eq(userInvitations.id, invitation.id));

      res.status(201).json({
        message: "Usuário criado com sucesso",
        user: newUser,
      });
    } catch (error) {
      console.error("Erro ao aceitar convite:", error);
      res.status(500).json({ message: "Erro ao aceitar convite" });
    }
  });

  // GET - Verifica status de um convite pelo token
  app.get("/api/user-invitations/verify/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;

      const [invitation] = await db
        .select()
        .from(userInvitations)
        .where(eq(userInvitations.token, token));

      if (!invitation) {
        return res.status(404).json({ message: "Convite não encontrado" });
      }

      // Verificar se está expirado, mesmo que o status ainda seja pendente
      const isExpired = new Date(invitation.expiresAt) < new Date();
      
      if (isExpired && invitation.status === "pending") {
        // Atualiza o status para expirado se já passou da data
        await db
          .update(userInvitations)
          .set({ status: "expired" })
          .where(eq(userInvitations.id, invitation.id));
          
        invitation.status = "expired";
      }

      // Buscar informações da organização
      const organizationQuery = `
        SELECT name FROM organizations WHERE id = $1
      `;
      const result = await db.execute(sql.raw(organizationQuery, [invitation.organizationId]));
      const organizationName = result.rows[0]?.name || "Organização";

      res.json({
        ...invitation,
        organizationName,
        isValid: invitation.status === "pending" && !isExpired,
      });
    } catch (error) {
      console.error("Erro ao verificar convite:", error);
      res.status(500).json({ message: "Erro ao verificar convite" });
    }
  });

  // DELETE - Remove um convite (apenas para admins)
  app.delete("/api/user-invitations/:id", canManageInvitations, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);

      // Verificar se o convite existe
      const [invitation] = await db
        .select()
        .from(userInvitations)
        .where(eq(userInvitations.id, id));

      if (!invitation) {
        return res.status(404).json({ message: "Convite não encontrado" });
      }

      // Apenas admins podem excluir convites
      if (req.session.user?.role !== "admin") {
        return res.status(403).json({ message: "Apenas administradores podem excluir convites" });
      }

      await db
        .delete(userInvitations)
        .where(eq(userInvitations.id, id));

      res.json({ message: "Convite excluído com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir convite:", error);
      res.status(500).json({ message: "Erro ao excluir convite" });
    }
  });

  // GET - Estatísticas de convites
  app.get("/api/user-invitations/stats", async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const { organizationId } = req.query;
      
      // Para administradores sem filtro ou usuários de organização específica
      let whereClause = "";
      const params: any[] = [];
      
      if (req.session.user.role !== "admin" || organizationId) {
        const orgId = organizationId 
          ? parseInt(organizationId as string) 
          : req.session.user.organizationId;
          
        if (!orgId) {
          return res.status(400).json({ message: "ID da organização é necessário" });
        }
        
        whereClause = "WHERE organization_id = $1";
        params.push(orgId);
      }

      // Contagem total
      const totalQuery = `
        SELECT COUNT(*) FROM user_invitations ${whereClause}
      `;
      const totalResult = await db.execute(sql.raw(totalQuery, params));
      
      // Contagem por status
      const pendingParams = [...params];
      pendingParams.push(new Date().toISOString());
      
      const pendingQuery = `
        SELECT COUNT(*) FROM user_invitations 
        ${whereClause ? whereClause + " AND" : "WHERE"} status = 'pending' AND expires_at > $${params.length + 1}
      `;
      const pendingResult = await db.execute(sql.raw(pendingQuery, pendingParams));
      
      const acceptedQuery = `
        SELECT COUNT(*) FROM user_invitations 
        ${whereClause ? whereClause + " AND" : "WHERE"} status = 'accepted'
      `;
      const acceptedResult = await db.execute(sql.raw(acceptedQuery, params));
      
      const expiredQuery = `
        SELECT COUNT(*) FROM user_invitations 
        ${whereClause ? whereClause + " AND" : "WHERE"} (status = 'expired' OR (status = 'pending' AND expires_at <= $${params.length + 1}))
      `;
      const expiredResult = await db.execute(sql.raw(expiredQuery, pendingParams));

      res.json({
        total: parseInt(totalResult.rows[0].count),
        pending: parseInt(pendingResult.rows[0].count),
        accepted: parseInt(acceptedResult.rows[0].count),
        expired: parseInt(expiredResult.rows[0].count)
      });
    } catch (error) {
      console.error("Erro ao obter estatísticas de convites:", error);
      res.status(500).json({ message: "Erro ao obter estatísticas de convites" });
    }
  });
}

// Função para enviar email de convite
async function sendInvitationEmail(invitation: any) {
  const inviteUrl = `${process.env.APP_URL || 'http://localhost:3000'}/accept-invitation/${invitation.token}`;
  
  const emailContent = `
    <h1>Convite para participar do sistema</h1>
    <p>Você foi convidado para participar da plataforma.</p>
    <p>Para aceitar o convite, clique no link abaixo:</p>
    <p><a href="${inviteUrl}">Aceitar convite</a></p>
    <p>Este convite expira em 7 dias.</p>
  `;
  
  return await sendMail({
    to: invitation.email,
    subject: "Convite para participar do sistema",
    html: emailContent,
  });
}