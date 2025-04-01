import { Router, Request, Response } from "express";
import { db } from "../db";
import { eq, and, asc, desc } from "drizzle-orm";
import { 
  userGroups, 
  groupPermissions, 
  userGroupMemberships, 
  users, 
  userInvitations,
  insertUserGroupSchema, 
  insertGroupPermissionSchema, 
  insertUserGroupMembershipSchema, 
  insertUserInvitationSchema,
  invitationStatusEnum
} from "@shared/schema";
import { randomBytes } from "crypto";
import { sendTemplateEmail, EmailTemplate } from "../services/email";

export const userGroupsRouter = Router();

// Middleware de autenticação
const authenticate = (req: Request, res: Response, next: Function) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Usuário não autenticado" });
  }
  next();
};

// Middleware para verificar se é administrador da organização
const isOrgAdmin = (req: Request, res: Response, next: Function) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Usuário não autenticado" });
  }
  
  if (req.session.user.role !== 'admin' && req.session.user.role !== 'org_admin') {
    return res.status(403).json({ message: "Acesso permitido apenas para administradores" });
  }
  
  next();
};

// Middleware para verificar se o usuário pertence à organização
const belongsToOrganization = async (req: Request, res: Response, next: Function) => {
  if (!req.session || !req.session.user || !req.session.user.organizationId) {
    return res.status(401).json({ message: "Usuário não autenticado ou não pertence a uma organização" });
  }
  
  next();
};

/**
 * Listar todos os grupos de uma organização
 */
userGroupsRouter.get("/", authenticate, belongsToOrganization, async (req: Request, res: Response) => {
  try {
    const organizationId = req.session.user.organizationId;
    
    // Buscar grupos da organização
    const groups = await db.select()
      .from(userGroups)
      .where(eq(userGroups.organizationId, organizationId))
      .orderBy(asc(userGroups.name));
    
    res.json(groups);
  } catch (error) {
    console.error("Erro ao buscar grupos:", error);
    res.status(500).json({ message: "Falha ao buscar grupos" });
  }
});

/**
 * Obter um grupo específico pelo ID
 */
userGroupsRouter.get("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Buscar o grupo
    const [group] = await db.select()
      .from(userGroups)
      .where(eq(userGroups.id, parseInt(id)));
    
    if (!group) {
      return res.status(404).json({ message: "Grupo não encontrado" });
    }
    
    // Verificar se o usuário tem permissão para ver este grupo
    if (req.session.user.role !== 'admin' && 
        req.session.user.organizationId !== group.organizationId) {
      return res.status(403).json({ message: "Sem permissão para acessar este grupo" });
    }
    
    res.json(group);
  } catch (error) {
    console.error("Erro ao buscar grupo:", error);
    res.status(500).json({ message: "Falha ao buscar grupo" });
  }
});

/**
 * Criar um novo grupo de usuários
 */
userGroupsRouter.post("/", isOrgAdmin, belongsToOrganization, async (req: Request, res: Response) => {
  try {
    const organizationId = req.session.user.organizationId;
    
    // Validar dados do grupo
    const groupData = insertUserGroupSchema.parse({
      ...req.body,
      organizationId
    });
    
    // Criar grupo
    const [group] = await db.insert(userGroups)
      .values(groupData)
      .returning();
    
    res.status(201).json(group);
  } catch (error) {
    console.error("Erro ao criar grupo:", error);
    res.status(500).json({ message: "Falha ao criar grupo" });
  }
});

/**
 * Atualizar um grupo existente
 */
userGroupsRouter.put("/:id", isOrgAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Buscar o grupo para verificar se existe e se pertence à organização do usuário
    const [existingGroup] = await db.select()
      .from(userGroups)
      .where(eq(userGroups.id, parseInt(id)));
    
    if (!existingGroup) {
      return res.status(404).json({ message: "Grupo não encontrado" });
    }
    
    // Verificar se o usuário tem permissão para editar este grupo
    if (req.session.user.role !== 'admin' && 
        req.session.user.organizationId !== existingGroup.organizationId) {
      return res.status(403).json({ message: "Sem permissão para editar este grupo" });
    }
    
    // Atualizar grupo
    const [updatedGroup] = await db.update(userGroups)
      .set({
        name: req.body.name || existingGroup.name,
        description: req.body.description || existingGroup.description,
        isDefault: req.body.isDefault !== undefined ? req.body.isDefault : existingGroup.isDefault
      })
      .where(eq(userGroups.id, parseInt(id)))
      .returning();
    
    res.json(updatedGroup);
  } catch (error) {
    console.error("Erro ao atualizar grupo:", error);
    res.status(500).json({ message: "Falha ao atualizar grupo" });
  }
});

/**
 * Excluir um grupo
 */
userGroupsRouter.delete("/:id", isOrgAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Buscar o grupo para verificar se existe e se pertence à organização do usuário
    const [existingGroup] = await db.select()
      .from(userGroups)
      .where(eq(userGroups.id, parseInt(id)));
    
    if (!existingGroup) {
      return res.status(404).json({ message: "Grupo não encontrado" });
    }
    
    // Verificar se o usuário tem permissão para excluir este grupo
    if (req.session.user.role !== 'admin' && 
        req.session.user.organizationId !== existingGroup.organizationId) {
      return res.status(403).json({ message: "Sem permissão para excluir este grupo" });
    }
    
    // Verificar se o grupo é padrão
    if (existingGroup.isDefault) {
      return res.status(400).json({ message: "Não é possível excluir um grupo padrão" });
    }
    
    // Remover todas as associações com usuários
    await db.delete(userGroupMemberships)
      .where(eq(userGroupMemberships.groupId, parseInt(id)));
    
    // Remover todas as permissões do grupo
    await db.delete(groupPermissions)
      .where(eq(groupPermissions.groupId, parseInt(id)));
    
    // Excluir o grupo
    await db.delete(userGroups)
      .where(eq(userGroups.id, parseInt(id)));
    
    res.json({ message: "Grupo excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir grupo:", error);
    res.status(500).json({ message: "Falha ao excluir grupo" });
  }
});

/**
 * Obter permissões de um grupo
 */
userGroupsRouter.get("/:id/permissions", authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Buscar o grupo para verificar se existe
    const [group] = await db.select()
      .from(userGroups)
      .where(eq(userGroups.id, parseInt(id)));
    
    if (!group) {
      return res.status(404).json({ message: "Grupo não encontrado" });
    }
    
    // Verificar se o usuário tem permissão para ver este grupo
    if (req.session.user.role !== 'admin' && 
        req.session.user.organizationId !== group.organizationId) {
      return res.status(403).json({ message: "Sem permissão para acessar este grupo" });
    }
    
    // Buscar permissões do grupo
    const permissions = await db.select()
      .from(groupPermissions)
      .where(eq(groupPermissions.groupId, parseInt(id)));
    
    res.json(permissions);
  } catch (error) {
    console.error("Erro ao buscar permissões do grupo:", error);
    res.status(500).json({ message: "Falha ao buscar permissões do grupo" });
  }
});

/**
 * Atualizar permissões de um grupo
 * O corpo da requisição deve conter um array com as novas permissões
 */
userGroupsRouter.post("/:id/permissions", isOrgAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    
    // Verificar se o grupo existe
    const [group] = await db.select()
      .from(userGroups)
      .where(eq(userGroups.id, parseInt(id)));
    
    if (!group) {
      return res.status(404).json({ message: "Grupo não encontrado" });
    }
    
    // Verificar se o usuário tem permissão para editar este grupo
    if (req.session.user.role !== 'admin' && 
        req.session.user.organizationId !== group.organizationId) {
      return res.status(403).json({ message: "Sem permissão para editar este grupo" });
    }
    
    // Remover permissões antigas
    await db.delete(groupPermissions)
      .where(eq(groupPermissions.groupId, parseInt(id)));
    
    // Adicionar novas permissões
    if (Array.isArray(permissions) && permissions.length > 0) {
      const permissionPromises = permissions.map(permission => {
        const permissionData = insertGroupPermissionSchema.parse({
          ...permission,
          groupId: parseInt(id)
        });
        
        return db.insert(groupPermissions)
          .values(permissionData);
      });
      
      await Promise.all(permissionPromises);
    }
    
    // Buscar as novas permissões
    const updatedPermissions = await db.select()
      .from(groupPermissions)
      .where(eq(groupPermissions.groupId, parseInt(id)));
    
    res.json(updatedPermissions);
  } catch (error) {
    console.error("Erro ao atualizar permissões do grupo:", error);
    res.status(500).json({ message: "Falha ao atualizar permissões do grupo" });
  }
});

/**
 * Listar membros de um grupo
 */
userGroupsRouter.get("/:id/members", authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se o grupo existe
    const [group] = await db.select()
      .from(userGroups)
      .where(eq(userGroups.id, parseInt(id)));
    
    if (!group) {
      return res.status(404).json({ message: "Grupo não encontrado" });
    }
    
    // Verificar se o usuário tem permissão para ver este grupo
    if (req.session.user.role !== 'admin' && 
        req.session.user.organizationId !== group.organizationId) {
      return res.status(403).json({ message: "Sem permissão para acessar este grupo" });
    }
    
    // Buscar membros do grupo
    const members = await db.select({
      id: users.id,
      username: users.username,
      name: users.name,
      email: users.email,
      role: users.role,
      profilePhoto: users.profilePhoto,
      membershipId: userGroupMemberships.id,
      assignedAt: userGroupMemberships.assignedAt,
      assignedBy: userGroupMemberships.assignedBy,
    })
    .from(userGroupMemberships)
    .leftJoin(users, eq(userGroupMemberships.userId, users.id))
    .where(eq(userGroupMemberships.groupId, parseInt(id)));
    
    res.json(members);
  } catch (error) {
    console.error("Erro ao buscar membros do grupo:", error);
    res.status(500).json({ message: "Falha ao buscar membros do grupo" });
  }
});

/**
 * Adicionar um usuário a um grupo
 */
userGroupsRouter.post("/:id/members", isOrgAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "ID do usuário é obrigatório" });
    }
    
    // Verificar se o grupo existe
    const [group] = await db.select()
      .from(userGroups)
      .where(eq(userGroups.id, parseInt(id)));
    
    if (!group) {
      return res.status(404).json({ message: "Grupo não encontrado" });
    }
    
    // Verificar se o usuário tem permissão para editar este grupo
    if (req.session.user.role !== 'admin' && 
        req.session.user.organizationId !== group.organizationId) {
      return res.status(403).json({ message: "Sem permissão para editar este grupo" });
    }
    
    // Verificar se o usuário existe e pertence à mesma organização
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    
    if (user.organizationId !== group.organizationId) {
      return res.status(400).json({ message: "Usuário não pertence à mesma organização do grupo" });
    }
    
    // Verificar se o usuário já está no grupo
    const [existingMembership] = await db.select()
      .from(userGroupMemberships)
      .where(
        and(
          eq(userGroupMemberships.userId, userId),
          eq(userGroupMemberships.groupId, parseInt(id))
        )
      );
    
    if (existingMembership) {
      return res.status(400).json({ message: "Usuário já é membro deste grupo" });
    }
    
    // Adicionar usuário ao grupo
    const [membership] = await db.insert(userGroupMemberships)
      .values({
        userId,
        groupId: parseInt(id),
        assignedBy: req.session.user.id,
        assignedAt: new Date()
      })
      .returning();
    
    res.status(201).json(membership);
  } catch (error) {
    console.error("Erro ao adicionar usuário ao grupo:", error);
    res.status(500).json({ message: "Falha ao adicionar usuário ao grupo" });
  }
});

/**
 * Remover um usuário de um grupo
 */
userGroupsRouter.delete("/:groupId/members/:userId", isOrgAdmin, async (req: Request, res: Response) => {
  try {
    const { groupId, userId } = req.params;
    
    // Verificar se o grupo existe
    const [group] = await db.select()
      .from(userGroups)
      .where(eq(userGroups.id, parseInt(groupId)));
    
    if (!group) {
      return res.status(404).json({ message: "Grupo não encontrado" });
    }
    
    // Verificar se o usuário tem permissão para editar este grupo
    if (req.session.user.role !== 'admin' && 
        req.session.user.organizationId !== group.organizationId) {
      return res.status(403).json({ message: "Sem permissão para editar este grupo" });
    }
    
    // Remover associação
    await db.delete(userGroupMemberships)
      .where(
        and(
          eq(userGroupMemberships.userId, parseInt(userId)),
          eq(userGroupMemberships.groupId, parseInt(groupId))
        )
      );
    
    res.json({ message: "Usuário removido do grupo" });
  } catch (error) {
    console.error("Erro ao remover usuário do grupo:", error);
    res.status(500).json({ message: "Falha ao remover usuário do grupo" });
  }
});

// ======== CONVITES DE USUÁRIOS ========

/**
 * Listar todos os convites da organização
 */
userGroupsRouter.get("/invitations", authenticate, belongsToOrganization, async (req: Request, res: Response) => {
  try {
    const organizationId = req.session.user.organizationId;
    
    // Buscar convites da organização
    const invitations = await db.select({
      id: userInvitations.id,
      email: userInvitations.email,
      status: userInvitations.status,
      expiresAt: userInvitations.expiresAt,
      groupId: userInvitations.groupId,
      groupName: userGroups.name,
      createdBy: userInvitations.createdBy,
      createdAt: userInvitations.createdAt,
    })
    .from(userInvitations)
    .leftJoin(userGroups, eq(userInvitations.groupId, userGroups.id))
    .where(eq(userInvitations.organizationId, organizationId))
    .orderBy(desc(userInvitations.createdAt));
    
    res.json(invitations);
  } catch (error) {
    console.error("Erro ao buscar convites:", error);
    res.status(500).json({ message: "Falha ao buscar convites" });
  }
});

/**
 * Criar um novo convite
 */
userGroupsRouter.post("/invitations", isOrgAdmin, belongsToOrganization, async (req: Request, res: Response) => {
  try {
    const { email, groupId } = req.body;
    
    if (!email || !groupId) {
      return res.status(400).json({ message: "Email e grupo são obrigatórios" });
    }
    
    // Verificar se o grupo existe e pertence à organização
    const [group] = await db.select()
      .from(userGroups)
      .where(eq(userGroups.id, groupId));
    
    if (!group) {
      return res.status(404).json({ message: "Grupo não encontrado" });
    }
    
    if (group.organizationId !== req.session.user.organizationId) {
      return res.status(403).json({ message: "Sem permissão para convidar para este grupo" });
    }
    
    // Verificar se já existe um convite pendente para este email nesta organização
    const [existingInvitation] = await db.select()
      .from(userInvitations)
      .where(
        and(
          eq(userInvitations.email, email),
          eq(userInvitations.organizationId, req.session.user.organizationId),
          eq(userInvitations.status, "pending")
        )
      );
    
    if (existingInvitation) {
      return res.status(400).json({ message: "Já existe um convite pendente para este email" });
    }
    
    // Gerar token de convite
    const token = randomBytes(32).toString('hex');
    
    // Calcular data de expiração (7 dias)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Criar convite
    const [invitation] = await db.insert(userInvitations)
      .values({
        email,
        groupId,
        organizationId: req.session.user.organizationId,
        token,
        status: "pending",
        expiresAt,
        createdBy: req.session.user.id,
        createdAt: new Date()
      })
      .returning();
    
    // Enviar email com o convite
    try {
      // Buscar nome da organização
      const [organization] = await db.select()
        .from('organizations')
        .where(eq('organizations.id', req.session.user.organizationId));
      
      const organizationName = organization ? organization.name : 'Endurancy';
      const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${token}`;
      
      await sendTemplateEmail(
        email,
        `Convite para participar da organização ${organizationName}`,
        "user_invitation" as EmailTemplate,
        {
          organizationName,
          invitationUrl,
          expiresAt: expiresAt.toLocaleDateString('pt-BR'),
          inviterName: req.session.user.name
        }
      );
    } catch (emailError) {
      console.error("Erro ao enviar email de convite:", emailError);
      // Não interromper o fluxo se o email falhar
    }
    
    res.status(201).json(invitation);
  } catch (error) {
    console.error("Erro ao criar convite:", error);
    res.status(500).json({ message: "Falha ao criar convite" });
  }
});

/**
 * Reenviar um convite
 */
userGroupsRouter.post("/invitations/:id/resend", isOrgAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Buscar o convite
    const [invitation] = await db.select()
      .from(userInvitations)
      .where(eq(userInvitations.id, parseInt(id)));
    
    if (!invitation) {
      return res.status(404).json({ message: "Convite não encontrado" });
    }
    
    // Verificar se o usuário tem permissão para reenviar este convite
    if (req.session.user.role !== 'admin' && 
        req.session.user.organizationId !== invitation.organizationId) {
      return res.status(403).json({ message: "Sem permissão para reenviar este convite" });
    }
    
    // Verificar se o convite ainda está pendente
    if (invitation.status !== "pending") {
      return res.status(400).json({ message: "Apenas convites pendentes podem ser reenviados" });
    }
    
    // Atualizar data de expiração (7 dias a partir de agora)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Atualizar convite
    const [updatedInvitation] = await db.update(userInvitations)
      .set({
        expiresAt,
      })
      .where(eq(userInvitations.id, parseInt(id)))
      .returning();
    
    // Enviar email com o convite
    try {
      // Buscar nome da organização
      const [organization] = await db.select()
        .from('organizations')
        .where(eq('organizations.id', invitation.organizationId));
      
      // Buscar nome do grupo
      const [group] = await db.select()
        .from(userGroups)
        .where(eq(userGroups.id, invitation.groupId));
      
      const organizationName = organization ? organization.name : 'Endurancy';
      const groupName = group ? group.name : 'Grupo de usuários';
      const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${invitation.token}`;
      
      await sendTemplateEmail(
        invitation.email,
        `Lembrete: Convite para participar da organização ${organizationName}`,
        "user_invitation_reminder" as EmailTemplate,
        {
          organizationName,
          groupName,
          invitationUrl,
          expiresAt: expiresAt.toLocaleDateString('pt-BR'),
          inviterName: req.session.user.name
        }
      );
    } catch (emailError) {
      console.error("Erro ao enviar email de convite:", emailError);
      // Não interromper o fluxo se o email falhar
    }
    
    res.json(updatedInvitation);
  } catch (error) {
    console.error("Erro ao reenviar convite:", error);
    res.status(500).json({ message: "Falha ao reenviar convite" });
  }
});

/**
 * Cancelar um convite
 */
userGroupsRouter.put("/invitations/:id/cancel", isOrgAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Buscar o convite
    const [invitation] = await db.select()
      .from(userInvitations)
      .where(eq(userInvitations.id, parseInt(id)));
    
    if (!invitation) {
      return res.status(404).json({ message: "Convite não encontrado" });
    }
    
    // Verificar se o usuário tem permissão para cancelar este convite
    if (req.session.user.role !== 'admin' && 
        req.session.user.organizationId !== invitation.organizationId) {
      return res.status(403).json({ message: "Sem permissão para cancelar este convite" });
    }
    
    // Verificar se o convite ainda está pendente
    if (invitation.status !== "pending") {
      return res.status(400).json({ message: "Apenas convites pendentes podem ser cancelados" });
    }
    
    // Atualizar convite
    const [updatedInvitation] = await db.update(userInvitations)
      .set({
        status: "expired",
      })
      .where(eq(userInvitations.id, parseInt(id)))
      .returning();
    
    res.json(updatedInvitation);
  } catch (error) {
    console.error("Erro ao cancelar convite:", error);
    res.status(500).json({ message: "Falha ao cancelar convite" });
  }
});

/**
 * Verificar um token de convite
 * Esta rota é pública e usada para verificar se um token é válido
 */
userGroupsRouter.get("/invitations/verify/:token", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    // Buscar o convite pelo token
    const [invitation] = await db.select({
      id: userInvitations.id,
      email: userInvitations.email,
      status: userInvitations.status,
      expiresAt: userInvitations.expiresAt,
      organizationId: userInvitations.organizationId,
      groupId: userInvitations.groupId,
      organizationName: 'organizations.name',
      groupName: userGroups.name,
    })
    .from(userInvitations)
    .leftJoin('organizations', eq(userInvitations.organizationId, 'organizations.id'))
    .leftJoin(userGroups, eq(userInvitations.groupId, userGroups.id))
    .where(eq(userInvitations.token, token));
    
    if (!invitation) {
      return res.status(404).json({ message: "Convite não encontrado" });
    }
    
    // Verificar se o convite está expirado
    if (invitation.status !== "pending") {
      return res.status(400).json({ message: "Este convite já foi utilizado ou cancelado" });
    }
    
    if (new Date() > new Date(invitation.expiresAt)) {
      // Marcar como expirado no banco
      await db.update(userInvitations)
        .set({ status: "expired" })
        .where(eq(userInvitations.id, invitation.id));
      
      return res.status(400).json({ message: "Este convite expirou" });
    }
    
    res.json(invitation);
  } catch (error) {
    console.error("Erro ao verificar convite:", error);
    res.status(500).json({ message: "Falha ao verificar convite" });
  }
});

/**
 * Aceitar um convite
 * Esta rota é usada para aceitar um convite e criar uma conta
 */
userGroupsRouter.post("/invitations/accept/:token", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { username, name, password } = req.body;
    
    if (!username || !name || !password) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }
    
    // Buscar o convite pelo token
    const [invitation] = await db.select()
      .from(userInvitations)
      .where(eq(userInvitations.token, token));
    
    if (!invitation) {
      return res.status(404).json({ message: "Convite não encontrado" });
    }
    
    // Verificar se o convite está válido
    if (invitation.status !== "pending") {
      return res.status(400).json({ message: "Este convite já foi utilizado ou cancelado" });
    }
    
    if (new Date() > new Date(invitation.expiresAt)) {
      return res.status(400).json({ message: "Este convite expirou" });
    }
    
    // Verificar se já existe um usuário com este username
    const [existingUser] = await db.select()
      .from(users)
      .where(eq(users.username, username));
    
    if (existingUser) {
      return res.status(400).json({ message: "Este nome de usuário já está em uso" });
    }
    
    // Buscar grupo para determinar o papel (role) do usuário
    const [group] = await db.select()
      .from(userGroups)
      .where(eq(userGroups.id, invitation.groupId));
    
    if (!group) {
      return res.status(404).json({ message: "Grupo não encontrado" });
    }
    
    // Determinar o papel do usuário (assumindo 'employee' como padrão)
    const role = 'employee';
    
    // Criar o usuário
    const [user] = await db.insert(users)
      .values({
        username,
        password, // Em uma implementação real, a senha seria hasheada
        name,
        email: invitation.email,
        role,
        organizationId: invitation.organizationId,
        createdAt: new Date()
      })
      .returning();
    
    // Adicionar o usuário ao grupo
    await db.insert(userGroupMemberships)
      .values({
        userId: user.id,
        groupId: invitation.groupId,
        assignedBy: invitation.createdBy,
        assignedAt: new Date()
      });
    
    // Marcar o convite como aceito
    await db.update(userInvitations)
      .set({ status: "accepted" })
      .where(eq(userInvitations.id, invitation.id));
    
    res.status(201).json({ 
      message: "Conta criada com sucesso",
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId
      }
    });
  } catch (error) {
    console.error("Erro ao aceitar convite:", error);
    res.status(500).json({ message: "Falha ao aceitar convite" });
  }
});