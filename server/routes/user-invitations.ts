import { Request, Response } from "express";
import { eq, and, lt, sql } from "drizzle-orm";
import { db } from "../db";
import { userInvitations, userGroups, users } from "@shared/schema";
import { randomUUID } from "crypto";
import { addDays } from 'date-fns';

// Send invitation email function (placeholder for actual email sending)
const sendInvitationEmail = async (email: string, token: string, orgName: string, role: string) => {
  // In a real implementation, you would send an email with a link containing the token
  console.log(`Sending invitation email to ${email} with token ${token} for organization ${orgName}`);
  // Example: await emailService.sendInvitation(email, token, orgName);
  return true;
};

export function registerUserInvitationRoutes(app: any) {
  // Get all invitations for an organization
  app.get("/api/user-invitations", async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const { organizationId } = req.query;
      
      // Only admins and org_admins can view invitations
      if (req.session.user.role !== "admin" && req.session.user.role !== "org_admin") {
        return res.status(403).json({ message: "Sem permissão para visualizar convites" });
      }
      
      let invitations = [];
      if (organizationId) {
        // Check if user is authorized to view this organization's invitations
        if (req.session.user.role !== "admin" && req.session.user.organizationId !== parseInt(organizationId as string)) {
          return res.status(403).json({ message: "Sem permissão para visualizar convites desta organização" });
        }
        
        // Get invitations for the specified organization
        invitations = await db
          .select()
          .from(userInvitations)
          .where(eq(userInvitations.organizationId, parseInt(organizationId as string)));
      } else if (req.session.user.role === "admin") {
        // Admin can see all invitations
        invitations = await db.select().from(userInvitations);
      } else if (req.session.user.organizationId) {
        // Org admin can only see invitations for their organization
        invitations = await db
          .select()
          .from(userInvitations)
          .where(eq(userInvitations.organizationId, req.session.user.organizationId));
      }
      
      // Add group name to invitations where applicable
      const result = await Promise.all(invitations.map(async (invite) => {
        if (invite.groupId) {
          const [group] = await db
            .select({
              name: userGroups.name
            })
            .from(userGroups)
            .where(eq(userGroups.id, invite.groupId));
            
          return { ...invite, groupName: group?.name };
        }
        return invite;
      }));
      
      return res.json(result);
    } catch (error) {
      console.error("Erro ao buscar convites:", error);
      res.status(500).json({ message: "Falha ao buscar convites" });
    }
  });

  // Get invitation by token (for accepting invitations)
  app.get("/api/user-invitations/token/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      const [invitation] = await db
        .select({
          id: userInvitations.id,
          email: userInvitations.email,
          role: userInvitations.role,
          status: userInvitations.status,
          organizationId: userInvitations.organizationId,
          expiresAt: userInvitations.expiresAt
        })
        .from(userInvitations)
        .where(eq(userInvitations.token, token));
        
      if (!invitation) {
        return res.status(404).json({ message: "Convite não encontrado" });
      }
      
      // Check if invitation is expired
      if (new Date(invitation.expiresAt) < new Date()) {
        return res.status(400).json({ message: "Convite expirado" });
      }
      
      // Check if invitation is already accepted
      if (invitation.status !== "pending") {
        return res.status(400).json({ message: `Convite já ${invitation.status === 'accepted' ? 'aceito' : 'expirado'}` });
      }
      
      return res.json(invitation);
    } catch (error) {
      console.error("Erro ao buscar convite por token:", error);
      res.status(500).json({ message: "Falha ao buscar detalhes do convite" });
    }
  });

  // Create invitation
  app.post("/api/user-invitations", async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      const { email, role, groupId, organizationId } = req.body;
      
      // Validate inputs
      if (!email) {
        return res.status(400).json({ message: "Email é obrigatório" });
      }
      
      if (!role) {
        return res.status(400).json({ message: "Função é obrigatória" });
      }
      
      if (!organizationId) {
        return res.status(400).json({ message: "ID da organização é obrigatório" });
      }
      
      // Check if user has permission to invite for this organization
      if (req.session.user.role !== "admin" && req.session.user.organizationId !== organizationId) {
        return res.status(403).json({ message: "Sem permissão para enviar convites para esta organização" });
      }
      
      // Check if the group exists and belongs to the organization
      if (groupId) {
        const [group] = await db
          .select()
          .from(userGroups)
          .where(eq(userGroups.id, groupId));
          
        if (!group) {
          return res.status(404).json({ message: "Grupo não encontrado" });
        }
        
        if (group.organizationId !== organizationId) {
          return res.status(400).json({ message: "Grupo não pertence à organização especificada" });
        }
      }
      
      // Check if user with this email already exists in the organization
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .where(eq(users.organizationId, organizationId));
        
      if (existingUser) {
        return res.status(400).json({ message: "Usuário com este email já existe na organização" });
      }
      
      // Check for existing pending invitation
      const [existingInvitation] = await db
        .select()
        .from(userInvitations)
        .where(eq(userInvitations.email, email))
        .where(eq(userInvitations.organizationId, organizationId))
        .where(eq(userInvitations.status, "pending"));
        
      if (existingInvitation) {
        return res.status(400).json({ message: "Já existe um convite pendente para este email" });
      }
      
      // Generate a unique token
      const token = randomUUID();
      
      // Set expiration date (7 days from now)
      const expiresAt = addDays(new Date(), 7);
      
      // Create invitation
      const [invitation] = await db
        .insert(userInvitations)
        .values({
          email,
          role,
          token,
          groupId: groupId || null,
          organizationId,
          expiresAt: expiresAt.toISOString(),
          createdBy: req.session.user.id,
          status: "pending"
        })
        .returning();
        
      // Get organization name for the email
      const [organization] = await db
        .execute(sql`SELECT name FROM organizations WHERE id = ${organizationId}`);
        
      // Send invitation email
      await sendInvitationEmail(email, token, organization?.name || "Organização", role);
      
      return res.status(201).json(invitation);
    } catch (error) {
      console.error("Erro ao criar convite:", error);
      res.status(500).json({ message: "Falha ao criar convite" });
    }
  });

  // Accept invitation
  app.post("/api/user-invitations/accept", async (req: Request, res: Response) => {
    try {
      const { token, password, name } = req.body;
      
      if (!token || !password || !name) {
        return res.status(400).json({ message: "Token, senha e nome são obrigatórios" });
      }
      
      // Find the invitation
      const [invitation] = await db
        .select()
        .from(userInvitations)
        .where(eq(userInvitations.token, token));
        
      if (!invitation) {
        return res.status(404).json({ message: "Convite não encontrado" });
      }
      
      // Check if invitation is expired
      if (new Date(invitation.expiresAt) < new Date()) {
        // Update status to expired
        await db
          .update(userInvitations)
          .set({ status: "expired" })
          .where(eq(userInvitations.id, invitation.id));
          
        return res.status(400).json({ message: "Convite expirado" });
      }
      
      // Check if invitation is already accepted
      if (invitation.status !== "pending") {
        return res.status(400).json({ message: `Convite já ${invitation.status === 'accepted' ? 'aceito' : 'expirado'}` });
      }
      
      // Check if user with this email already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, invitation.email));
        
      if (existingUser) {
        // If user exists but is not in the organization, update their organization
        if (!existingUser.organizationId) {
          await db
            .update(users)
            .set({ 
              organizationId: invitation.organizationId,
              role: invitation.role
            })
            .where(eq(users.id, existingUser.id));
            
          // Add user to the group if specified
          if (invitation.groupId) {
            await db
              .insert(sql`user_group_memberships`)
              .values({
                userId: existingUser.id,
                groupId: invitation.groupId
              })
              .onConflictDoNothing();
          }
          
          // Update invitation status
          await db
            .update(userInvitations)
            .set({ status: "accepted" })
            .where(eq(userInvitations.id, invitation.id));
            
          return res.json({ 
            message: "Convite aceito, sua conta foi associada à organização",
            user: existingUser
          });
        } else {
          return res.status(400).json({ message: "Usuário já está associado a uma organização" });
        }
      }
      
      // Create a new user
      const [newUser] = await db
        .insert(users)
        .values({
          username: invitation.email,
          email: invitation.email,
          name,
          password, // In a real implementation, this would be hashed
          role: invitation.role,
          organizationId: invitation.organizationId
        })
        .returning();
        
      // Add user to the group if specified
      if (invitation.groupId) {
        await db
          .insert(sql`user_group_memberships`)
          .values({
            userId: newUser.id,
            groupId: invitation.groupId
          });
      }
      
      // Update invitation status
      await db
        .update(userInvitations)
        .set({ status: "accepted" })
        .where(eq(userInvitations.id, invitation.id));
        
      return res.status(201).json({
        message: "Conta criada com sucesso",
        user: newUser
      });
    } catch (error) {
      console.error("Erro ao aceitar convite:", error);
      res.status(500).json({ message: "Falha ao processar o convite" });
    }
  });

  // Resend invitation
  app.post("/api/user-invitations/:id/resend", async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      const { id } = req.params;
      
      // Find the invitation
      const [invitation] = await db
        .select()
        .from(userInvitations)
        .where(eq(userInvitations.id, parseInt(id)));
        
      if (!invitation) {
        return res.status(404).json({ message: "Convite não encontrado" });
      }
      
      // Check if user has permission to resend this invitation
      if (req.session.user.role !== "admin" && req.session.user.organizationId !== invitation.organizationId) {
        return res.status(403).json({ message: "Sem permissão para reenviar este convite" });
      }
      
      // Check if invitation is already accepted
      if (invitation.status !== "pending") {
        return res.status(400).json({ message: `Não é possível reenviar convite ${invitation.status === 'accepted' ? 'aceito' : 'expirado'}` });
      }
      
      // Generate a new token
      const token = randomUUID();
      
      // Set new expiration date (7 days from now)
      const expiresAt = addDays(new Date(), 7);
      
      // Update invitation
      const [updatedInvitation] = await db
        .update(userInvitations)
        .set({
          token,
          expiresAt: expiresAt.toISOString()
        })
        .where(eq(userInvitations.id, parseInt(id)))
        .returning();
        
      // Get organization name for the email
      const [organization] = await db
        .execute(sql`SELECT name FROM organizations WHERE id = ${invitation.organizationId}`);
        
      // Send invitation email
      await sendInvitationEmail(invitation.email, token, organization?.name || "Organização", invitation.role);
      
      return res.json({
        message: "Convite reenviado com sucesso",
        invitation: updatedInvitation
      });
    } catch (error) {
      console.error("Erro ao reenviar convite:", error);
      res.status(500).json({ message: "Falha ao reenviar convite" });
    }
  });

  // Cancel invitation
  app.delete("/api/user-invitations/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      const { id } = req.params;
      
      // Find the invitation
      const [invitation] = await db
        .select()
        .from(userInvitations)
        .where(eq(userInvitations.id, parseInt(id)));
        
      if (!invitation) {
        return res.status(404).json({ message: "Convite não encontrado" });
      }
      
      // Check if user has permission to cancel this invitation
      if (req.session.user.role !== "admin" && req.session.user.organizationId !== invitation.organizationId) {
        return res.status(403).json({ message: "Sem permissão para cancelar este convite" });
      }
      
      // Delete the invitation
      await db
        .delete(userInvitations)
        .where(eq(userInvitations.id, parseInt(id)));
        
      return res.sendStatus(204);
    } catch (error) {
      console.error("Erro ao cancelar convite:", error);
      res.status(500).json({ message: "Falha ao cancelar convite" });
    }
  });

  // Clean up expired invitations (could be run via a cron job)
  app.post("/api/user-invitations/cleanup", async (req: Request, res: Response) => {
    try {
      if (!req.session.user || req.session.user.role !== "admin") {
        return res.status(403).json({ message: "Acesso não autorizado" });
      }
      
      // Update status of expired invitations
      const { count } = await db
        .update(userInvitations)
        .set({ status: "expired" })
        .where(
          and(
            eq(userInvitations.status, "pending"),
            lt(userInvitations.expiresAt, new Date().toISOString())
          )
        )
        .returning({ count: sql`count(*)` });
        
      return res.json({ message: `${count} convites expirados atualizados` });
    } catch (error) {
      console.error("Erro ao limpar convites expirados:", error);
      res.status(500).json({ message: "Falha ao limpar convites expirados" });
    }
  });
}