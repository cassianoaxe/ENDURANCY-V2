import { Router } from 'express';
import { db } from './db';
import { v4 as uuidv4 } from 'uuid';
import { and, eq } from 'drizzle-orm';
import { authenticatedOnly } from './utils';
import { members, users, organizations } from '@shared/schema';

const router = Router();

// ============= ROTAS PARA O AMBIENTE DA ORGANIZAÇÃO =============

// Listar membros da organização específica
router.get('/organizations/:organizationId/members', authenticatedOnly, async (req, res) => {
  const organizationId = parseInt(req.params.organizationId);
  const userId = req.user?.id;
  
  try {
    // Verificar se o usuário tem permissão para acessar membros desta organização
    if (req.user?.role !== 'admin' && req.user?.organizationId !== organizationId) {
      return res.status(403).json({ message: 'Acesso não autorizado aos membros desta organização' });
    }
    
    // Buscar todos os membros da organização
    const membersList = await db.select({
      id: members.id,
      name: members.name,
      email: members.email,
      cpf: members.cpf,
      phone: members.phone,
      membershipId: members.membershipId,
      status: members.status,
      registrationDate: members.registrationDate,
      validUntil: members.validUntil,
      membershipType: members.membershipType,
      membershipLevel: members.membershipLevel,
      loyaltyPoints: members.loyaltyPoints,
      profilePhoto: members.profilePhoto
    })
    .from(members)
    .where(eq(members.organizationId, organizationId));
    
    res.json({
      count: membersList.length,
      members: membersList
    });
  } catch (error) {
    console.error('Erro ao buscar membros da organização:', error);
    res.status(500).json({ message: 'Erro interno ao buscar membros' });
  }
});

// Obter dados de um membro específico da organização
router.get('/organizations/:organizationId/members/:memberId', authenticatedOnly, async (req, res) => {
  const organizationId = parseInt(req.params.organizationId);
  const memberId = parseInt(req.params.memberId);
  const userId = req.user?.id;
  
  try {
    // Verificar se o usuário tem permissão para acessar membros desta organização
    if (req.user?.role !== 'admin' && req.user?.organizationId !== organizationId) {
      return res.status(403).json({ message: 'Acesso não autorizado a este membro' });
    }
    
    // Buscar membro específico
    const memberData = await db.query.members.findFirst({
      where: and(
        eq(members.id, memberId),
        eq(members.organizationId, organizationId)
      ),
    });
    
    if (!memberData) {
      return res.status(404).json({ message: 'Membro não encontrado nesta organização' });
    }
    
    // Buscar dados da organização associada
    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
      columns: {
        id: true,
        name: true,
        logo: true,
      }
    });
    
    res.json({
      ...memberData,
      organization
    });
  } catch (error) {
    console.error('Erro ao buscar dados do membro:', error);
    res.status(500).json({ message: 'Erro interno ao buscar dados do membro' });
  }
});

// Obter a própria carteirinha (para o membro logado)
router.get('/organizations/:organizationId/carteirinha/minha', authenticatedOnly, async (req, res) => {
  const organizationId = parseInt(req.params.organizationId);
  const userId = req.user?.id;
  
  try {
    // Buscar dados do membro associado ao usuário logado
    const memberData = await db.query.members.findFirst({
      where: and(
        eq(members.userId, userId),
        eq(members.organizationId, organizationId)
      ),
    });
    
    if (!memberData) {
      return res.status(404).json({ 
        message: 'Carteirinha não encontrada. Você não está registrado como membro nesta organização.'
      });
    }
    
    // Buscar dados da organização
    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
      columns: {
        id: true,
        name: true,
        logo: true,
      }
    });
    
    // Verificar validade da carteirinha
    const validUntil = new Date(memberData.validUntil);
    const isExpired = validUntil < new Date();
    const status = isExpired ? 'inactive' : memberData.status;
    
    res.json({
      isValid: status === 'active',
      member: memberData,
      organization
    });
  } catch (error) {
    console.error('Erro ao buscar carteirinha do membro:', error);
    res.status(500).json({ message: 'Erro interno ao buscar carteirinha' });
  }
});

// Gerar ou atualizar o ID de associado de um membro (ambiente da organização)
router.post('/organizations/:organizationId/members/:memberId/generate-membership-id', authenticatedOnly, async (req, res) => {
  const organizationId = parseInt(req.params.organizationId);
  const memberId = parseInt(req.params.memberId);
  
  // Apenas admin ou org_admin podem fazer isso
  if (req.user?.role !== 'admin' && req.user?.role !== 'org_admin') {
    return res.status(403).json({ message: 'Apenas administradores podem gerar códigos de associado' });
  }
  
  // Se for org_admin, verificar se pertence à organização
  if (req.user.role === 'org_admin' && req.user.organizationId !== organizationId) {
    return res.status(403).json({ message: 'Você não tem permissão para acessar esta organização' });
  }
  
  try {
    // Verificar se o membro existe e pertence à organização
    const memberData = await db.query.members.findFirst({
      where: and(
        eq(members.id, memberId),
        eq(members.organizationId, organizationId)
      ),
    });
    
    if (!memberData) {
      return res.status(404).json({ message: 'Membro não encontrado nesta organização' });
    }
    
    // Gerar um novo ID de associado se ainda não existir
    const membershipId = memberData.membershipId || `MEM-${organizationId}-${memberId}-${uuidv4().substring(0, 8)}`;
    
    // Atualizar o membro com o novo ID
    await db.update(members)
      .set({ membershipId })
      .where(eq(members.id, memberId));
    
    res.json({ 
      membershipId,
      message: 'ID de associado gerado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao gerar ID de associado:', error);
    res.status(500).json({ message: 'Erro interno ao gerar ID de associado' });
  }
});

// ============= ROTAS PÚBLICAS (SEM AUTENTICAÇÃO) =============

// Verificar carteirinha por ID de membro (endpoint público)
router.get('/verify/:membershipId', async (req, res) => {
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

export default router;