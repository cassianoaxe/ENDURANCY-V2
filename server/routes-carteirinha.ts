import { Router } from 'express';
import { db } from './db';
import { v4 as uuidv4 } from 'uuid';
import { and, eq } from 'drizzle-orm';
import { authenticatedOnly } from './utils';
import { members, users, organizations } from '@shared/schema';

const router = Router();

// Obter dados de membro específico
router.get('/members/:memberId', authenticatedOnly, async (req, res) => {
  const userId = req.user?.id;
  const memberId = req.params.memberId === 'me' ? userId : parseInt(req.params.memberId);
  
  try {
    let memberData;

    // Se o usuário é admin ou org_admin, pode acessar qualquer membro
    if (req.user?.role === 'admin' || req.user?.role === 'org_admin') {
      // O admin pode buscar qualquer membro pelo ID
      if (memberId !== userId) {
        memberData = await db.query.members.findFirst({
          where: eq(members.id, memberId),
        });
      }
    }
    
    // Se não encontrou pelo ID ou está buscando o próprio perfil
    if (!memberData && memberId === userId) {
      // Buscar dados do usuário logado
      memberData = await db.query.members.findFirst({
        where: eq(members.userId, userId),
      });
    }
    
    if (!memberData) {
      return res.status(404).json({ message: 'Membro não encontrado' });
    }
    
    // Buscar dados da organização associada
    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.id, memberData.organizationId),
      columns: {
        id: true,
        name: true,
        logo: true,
      }
    });
    
    // Se o usuário não é admin e não é o próprio membro ou da mesma organização
    if (
      req.user?.role !== 'admin' && 
      memberId !== userId && 
      req.user?.organizationId !== memberData.organizationId
    ) {
      return res.status(403).json({ message: 'Acesso não autorizado a este membro' });
    }
    
    res.json({
      ...memberData,
      organization
    });
  } catch (error) {
    console.error('Erro ao buscar dados do membro:', error);
    res.status(500).json({ message: 'Erro interno ao buscar dados do membro' });
  }
});

// Verificar carteirinha por ID de membro (endpoint público)
router.get('/members/verify/:membershipId', async (req, res) => {
  const { membershipId } = req.params;
  
  try {
    const memberData = await db.query.members.findFirst({
      where: eq(members.membershipId, membershipId),
    });
    
    if (!memberData) {
      return res.status(200).json({ 
        isValid: false,
        message: 'Carteirinha não encontrada ou inválida.'
      });
    }
    
    // Verificar se a carteirinha ainda é válida
    const validUntil = new Date(memberData.validUntil);
    const isExpired = validUntil < new Date();
    
    // Buscar dados da organização
    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.id, memberData.organizationId),
      columns: {
        id: true,
        name: true,
        logo: true,
      }
    });
    
    // Status baseado na validade e status do membro
    const status = isExpired ? 'inactive' : memberData.status;
    
    res.json({
      isValid: status === 'active',
      member: {
        name: memberData.name,
        membershipId: memberData.membershipId,
        registrationDate: memberData.registrationDate,
        validUntil: memberData.validUntil,
        status
      },
      organization
    });
  } catch (error) {
    console.error('Erro ao verificar carteirinha:', error);
    res.status(200).json({ 
      isValid: false,
      message: 'Erro ao processar a verificação. Tente novamente mais tarde.'
    });
  }
});

// Gerar ou atualizar o ID de associado de um membro
router.post('/members/:memberId/generate-membership-id', authenticatedOnly, async (req, res) => {
  // Apenas admin ou org_admin podem fazer isso
  if (req.user?.role !== 'admin' && req.user?.role !== 'org_admin') {
    return res.status(403).json({ message: 'Apenas administradores podem gerar códigos de associado' });
  }
  
  const memberId = parseInt(req.params.memberId);
  
  try {
    // Verificar se o membro existe
    const memberData = await db.query.members.findFirst({
      where: eq(members.id, memberId),
    });
    
    if (!memberData) {
      return res.status(404).json({ message: 'Membro não encontrado' });
    }
    
    // Se o usuário é org_admin, verificar se o membro pertence à mesma organização
    if (req.user.role === 'org_admin' && req.user.organizationId !== memberData.organizationId) {
      return res.status(403).json({ message: 'Acesso não autorizado a este membro' });
    }
    
    // Gerar um novo ID de associado se ainda não existir
    const membershipId = memberData.membershipId || `MEM-${memberId}-${uuidv4().substring(0, 8)}`;
    
    // Atualizar o membro com o novo ID
    await db.update(members)
      .set({ membershipId })
      .where(eq(members.id, memberId));
    
    res.json({ membershipId });
  } catch (error) {
    console.error('Erro ao gerar ID de associado:', error);
    res.status(500).json({ message: 'Erro interno ao gerar ID de associado' });
  }
});

export default router;