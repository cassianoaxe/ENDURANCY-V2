import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { userGroups, userGroupMemberships, users } from "@shared/schema";
import { randomUUID } from "crypto";

// Middleware for checking if user is authorized to access group
const isGroupAuthorized = async (req: Request, res: Response, next: Function) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  const { id: groupId } = req.params;
  const { id: userId, role, organizationId } = req.session.user;

  // Allow admin and org_admin to access any group
  if (role === "admin" || (role === "org_admin" && organizationId)) {
    return next();
  }

  // For other roles, check if they belong to the group
  try {
    const [group] = await db
      .select()
      .from(userGroups)
      .where(eq(userGroups.id, parseInt(groupId)));

    if (!group) {
      return res.status(404).json({ message: "Grupo não encontrado" });
    }

    // Check if group belongs to user's organization
    if (group.organizationId !== organizationId) {
      return res.status(403).json({ message: "Acesso não autorizado a este grupo" });
    }

    // Check if user is a member of the group
    const [membership] = await db
      .select()
      .from(userGroupMemberships)
      .where(eq(userGroupMemberships.userId, userId))
      .where(eq(userGroupMemberships.groupId, parseInt(groupId)));

    if (!membership) {
      return res.status(403).json({ message: "Você não é membro deste grupo" });
    }

    next();
  } catch (error) {
    console.error("Erro ao verificar autorização de grupo:", error);
    res.status(500).json({ message: "Erro interno ao verificar autorização" });
  }
};

export function registerUserGroupRoutes(app: any) {
  // Get all groups for an organization
  app.get("/api/user-groups", async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const { organizationId } = req.query;
      
      // If specific organization is requested, check if user is admin or belongs to that org
      if (organizationId) {
        const orgId = parseInt(organizationId as string);
        
        // If not admin and not from the requested org, deny access
        if (req.session.user.role !== "admin" && 
            req.session.user.organizationId !== orgId) {
          return res.status(403).json({ message: "Acesso não autorizado" });
        }
        
        const groups = await db
          .select()
          .from(userGroups)
          .where(eq(userGroups.organizationId, orgId));
          
        return res.json(groups);
      }
      
      // Admin can see all groups
      if (req.session.user.role === "admin") {
        const groups = await db.select().from(userGroups);
        return res.json(groups);
      }
      
      // Regular users can only see groups from their organization
      if (req.session.user.organizationId) {
        const groups = await db
          .select()
          .from(userGroups)
          .where(eq(userGroups.organizationId, req.session.user.organizationId));
          
        return res.json(groups);
      }
      
      // User without organization can't see any groups
      return res.json([]);
    } catch (error) {
      console.error("Erro ao buscar grupos:", error);
      res.status(500).json({ message: "Falha ao buscar grupos" });
    }
  });

  // Get a specific group
  app.get("/api/user-groups/:id", isGroupAuthorized, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [group] = await db
        .select()
        .from(userGroups)
        .where(eq(userGroups.id, parseInt(id)));
        
      if (!group) {
        return res.status(404).json({ message: "Grupo não encontrado" });
      }
      
      return res.json(group);
    } catch (error) {
      console.error("Erro ao buscar grupo:", error);
      res.status(500).json({ message: "Falha ao buscar detalhes do grupo" });
    }
  });

  // Create a new group
  app.post("/api/user-groups", async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      const { name, description, organizationId, isDefault } = req.body;
      
      // Require organization ID
      if (!organizationId) {
        return res.status(400).json({ message: "ID da organização é obrigatório" });
      }
      
      // Validate if user has permission to create a group for this organization
      if (req.session.user.role !== "admin" && 
          req.session.user.organizationId !== organizationId) {
        return res.status(403).json({ message: "Sem permissão para criar grupo nesta organização" });
      }
      
      const [group] = await db
        .insert(userGroups)
        .values({
          name,
          description,
          organizationId,
          isDefault: isDefault || false
        })
        .returning();
        
      return res.status(201).json(group);
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
      res.status(500).json({ message: "Falha ao criar grupo" });
    }
  });

  // Update a group
  app.put("/api/user-groups/:id", isGroupAuthorized, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, isDefault } = req.body;
      
      const [group] = await db
        .update(userGroups)
        .set({
          name,
          description,
          isDefault
        })
        .where(eq(userGroups.id, parseInt(id)))
        .returning();
        
      return res.json(group);
    } catch (error) {
      console.error("Erro ao atualizar grupo:", error);
      res.status(500).json({ message: "Falha ao atualizar grupo" });
    }
  });

  // Delete a group
  app.delete("/api/user-groups/:id", isGroupAuthorized, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if it's a default group
      const [group] = await db
        .select()
        .from(userGroups)
        .where(eq(userGroups.id, parseInt(id)));
        
      if (group?.isDefault) {
        return res.status(400).json({ message: "Não é possível excluir o grupo padrão" });
      }
      
      // Delete all memberships first
      await db
        .delete(userGroupMemberships)
        .where(eq(userGroupMemberships.groupId, parseInt(id)));
        
      // Then delete the group
      await db
        .delete(userGroups)
        .where(eq(userGroups.id, parseInt(id)));
        
      return res.sendStatus(204);
    } catch (error) {
      console.error("Erro ao excluir grupo:", error);
      res.status(500).json({ message: "Falha ao excluir grupo" });
    }
  });

  // Get group members
  app.get("/api/user-groups/:id/members", isGroupAuthorized, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const members = await db
        .select({
          id: users.id,
          name: users.name,
          username: users.username,
          email: users.email,
          role: users.role,
          profilePhoto: users.profilePhoto
        })
        .from(userGroupMemberships)
        .innerJoin(users, eq(userGroupMemberships.userId, users.id))
        .where(eq(userGroupMemberships.groupId, parseInt(id)));
        
      return res.json(members);
    } catch (error) {
      console.error("Erro ao buscar membros do grupo:", error);
      res.status(500).json({ message: "Falha ao buscar membros do grupo" });
    }
  });

  // Add user to a group
  app.post("/api/user-groups/:id/members", isGroupAuthorized, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "ID do usuário é obrigatório" });
      }
      
      // Check if user exists and is in the same organization
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
        
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      const [group] = await db
        .select()
        .from(userGroups)
        .where(eq(userGroups.id, parseInt(id)));
        
      if (user.organizationId !== group.organizationId) {
        return res.status(400).json({ message: "Usuário não pertence à mesma organização do grupo" });
      }
      
      // Check if already a member
      const [existingMembership] = await db
        .select()
        .from(userGroupMemberships)
        .where(eq(userGroupMemberships.userId, userId))
        .where(eq(userGroupMemberships.groupId, parseInt(id)));
        
      if (existingMembership) {
        return res.status(400).json({ message: "Usuário já é membro deste grupo" });
      }
      
      const [membership] = await db
        .insert(userGroupMemberships)
        .values({
          userId,
          groupId: parseInt(id)
        })
        .returning();
        
      return res.status(201).json(membership);
    } catch (error) {
      console.error("Erro ao adicionar membro ao grupo:", error);
      res.status(500).json({ message: "Falha ao adicionar membro ao grupo" });
    }
  });

  // Remove user from a group
  app.delete("/api/user-groups/:groupId/members/:userId", isGroupAuthorized, async (req: Request, res: Response) => {
    try {
      const { groupId, userId } = req.params;
      
      await db
        .delete(userGroupMemberships)
        .where(eq(userGroupMemberships.groupId, parseInt(groupId)))
        .where(eq(userGroupMemberships.userId, parseInt(userId)));
        
      return res.sendStatus(204);
    } catch (error) {
      console.error("Erro ao remover membro do grupo:", error);
      res.status(500).json({ message: "Falha ao remover membro do grupo" });
    }
  });
}