import { Router, Request, Response, NextFunction } from "express";
import { db } from "../db";
import { eq, and, desc, sql, ilike, or, like } from "drizzle-orm";
import {
  socialPartners,
  socialPartnerBenefits,
  socialBenefitUsage,
  insertSocialPartnerSchema,
  insertSocialPartnerBenefitSchema
} from "../../shared/schema-social";
import { authenticate } from "../routes";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// PATCH DE COMPATIBILIDADE PARA NODE_ENV = DEVELOPMENT
// Esta correção altera especificamente o modo como express responde
// para garantir JSON em desenvolvimento onde o Vite serve algumas 
// rotas como HTML por padrão
const DEV_MODE = process.env.NODE_ENV === 'development';

// Configuração para upload de arquivos (logos, banners, contratos)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/partners');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "contractFile") {
      // Para contratos, permitir PDFs
      const filetypes = /pdf/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      
      if (mimetype && extname) {
        return cb(null, true);
      }
      cb(new Error("Apenas arquivos PDF são permitidos para contratos."));
    } else {
      // Para logos e banners, permitir imagens
      const filetypes = /jpeg|jpg|png|gif/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      
      if (mimetype && extname) {
        return cb(null, true);
      }
      cb(new Error("Apenas imagens nos formatos .jpg, .jpeg, .png ou .gif são permitidas."));
    }
  },
});

// Função para verificar se o usuário é admin de associação
function isAssociation(req, res, next) {
  // Verificar autenticação
  if (!req.session || !req.session.user) {
    return res.status(401).json({ 
      message: "Não autenticado", 
      error: "Unauthorized",
      authenticated: false 
    });
  }
  
  // Verificar permissões
  if (req.user.role !== 'org_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ message: "Acesso negado. Apenas administradores de associações podem gerenciar parceiros." });
  }

  next();
}

// Função para gerar código de verificação para uso de benefício
function generateVerificationCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Middleware para garantir retorno de JSON em rotas de API não autenticadas
function ensureJsonResponse(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      message: "Não autenticado",
      error: "Unauthorized",
      authenticated: false
    });
  }
  next();
}

// Criar o router
export const socialPartnersRouter = Router();

// API alternativa específica para retornar apenas JSON quando não autenticado
socialPartnersRouter.get("/api-json", (req, res) => {
  // Este endpoint sempre retorna JSON e nunca HTML
  res.setHeader('Content-Type', 'application/json');
  
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      message: "Não autenticado",
      error: "Unauthorized",
      authenticated: false
    });
  }
  
  // Se autenticado, redirecionar para a API normal
  res.status(200).json({
    message: "Endpoint JSON funcionando corretamente",
    authenticated: true
  });
});

// Rota para listar parceiros - Adiciona middleware ensureJsonResponse antes de authenticate
socialPartnersRouter.get("/", ensureJsonResponse, authenticate, isAssociation, async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { category, status, query } = req.query;
    
    // Construir a query base
    let dbQuery = db
      .select()
      .from(socialPartners)
      .where(eq(socialPartners.organizationId, organizationId))
      .orderBy(desc(socialPartners.createdAt));
    
    // Adicionar filtros opcionais
    if (category) {
      dbQuery = dbQuery.where(eq(socialPartners.category, category));
    }
    
    if (status) {
      dbQuery = dbQuery.where(eq(socialPartners.status, status));
    }
    
    if (query) {
      const searchTerm = `%${query}%`;
      dbQuery = dbQuery.where(
        or(
          ilike(socialPartners.name, searchTerm),
          ilike(socialPartners.description, searchTerm),
          ilike(socialPartners.contactPerson, searchTerm)
        )
      );
    }
    
    const partners = await dbQuery;
    
    res.json(partners);
  } catch (error) {
    console.error("Erro ao listar parceiros:", error);
    res.status(500).json({ message: "Erro ao listar parceiros" });
  }
});

// Rota para obter detalhes de um parceiro específico com seus benefícios
socialPartnersRouter.get("/:id", ensureJsonResponse, authenticate, isAssociation, async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    // Buscar parceiro
    const [partner] = await db
      .select()
      .from(socialPartners)
      .where(
        and(
          eq(socialPartners.id, parseInt(id)),
          eq(socialPartners.organizationId, organizationId)
        )
      );
    
    if (!partner) {
      return res.status(404).json({ message: "Parceiro não encontrado" });
    }
    
    // Buscar benefícios do parceiro
    const benefits = await db
      .select()
      .from(socialPartnerBenefits)
      .where(
        and(
          eq(socialPartnerBenefits.partnerId, parseInt(id)),
          eq(socialPartnerBenefits.organizationId, organizationId)
        )
      )
      .orderBy(desc(socialPartnerBenefits.createdAt));
    
    // Retornar parceiro com seus benefícios
    res.json({ partner, benefits });
  } catch (error) {
    console.error("Erro ao buscar detalhes do parceiro:", error);
    res.status(500).json({ message: "Erro ao buscar detalhes do parceiro" });
  }
});

// Rota para criar novo parceiro
socialPartnersRouter.post("/", 
  ensureJsonResponse,
  authenticate, 
  isAssociation, 
  upload.fields([
    { name: "logoFile", maxCount: 1 },
    { name: "bannerFile", maxCount: 1 },
    { name: "contractFile", maxCount: 1 }
  ]), 
  async (req, res) => {
    try {
      const organizationId = req.user.organizationId;
      const partnerData = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Adicionar URLs de arquivos, se enviados
      if (files.logoFile) {
        partnerData.logoUrl = `/uploads/partners/${files.logoFile[0].filename}`;
      }
      
      if (files.bannerFile) {
        partnerData.bannerUrl = `/uploads/partners/${files.bannerFile[0].filename}`;
      }
      
      if (files.contractFile) {
        partnerData.contractUrl = `/uploads/partners/${files.contractFile[0].filename}`;
      }
      
      // Validar dados recebidos
      const parsedData = insertSocialPartnerSchema.safeParse({
        ...partnerData,
        organizationId,
        status: partnerData.status || "pending" // Status padrão: pendente
      });
      
      if (!parsedData.success) {
        return res.status(400).json({ 
          message: "Dados de parceiro inválidos", 
          errors: parsedData.error.errors 
        });
      }
      
      // Verificar se o CNPJ já está cadastrado
      const existingPartner = await db
        .select()
        .from(socialPartners)
        .where(
          and(
            eq(socialPartners.cnpj, parsedData.data.cnpj),
            eq(socialPartners.organizationId, organizationId)
          )
        );
      
      if (existingPartner.length > 0) {
        return res.status(400).json({ message: "Já existe um parceiro cadastrado com este CNPJ" });
      }
      
      // Criar parceiro
      const [newPartner] = await db
        .insert(socialPartners)
        .values(parsedData.data)
        .returning();
      
      res.status(201).json({
        message: "Parceiro cadastrado com sucesso!",
        partner: newPartner
      });
    } catch (error) {
      console.error("Erro ao cadastrar parceiro:", error);
      res.status(500).json({ message: "Erro ao cadastrar parceiro" });
    }
});

// Rota para atualizar parceiro
socialPartnersRouter.put("/:id", 
  ensureJsonResponse,
  authenticate, 
  isAssociation, 
  upload.fields([
    { name: "logoFile", maxCount: 1 },
    { name: "bannerFile", maxCount: 1 },
    { name: "contractFile", maxCount: 1 }
  ]), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const organizationId = req.user.organizationId;
      const partnerData = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Verificar se o parceiro existe
      const [existingPartner] = await db
        .select()
        .from(socialPartners)
        .where(
          and(
            eq(socialPartners.id, parseInt(id)),
            eq(socialPartners.organizationId, organizationId)
          )
        );
      
      if (!existingPartner) {
        return res.status(404).json({ message: "Parceiro não encontrado" });
      }
      
      // Adicionar URLs de arquivos, se enviados
      if (files.logoFile) {
        partnerData.logoUrl = `/uploads/partners/${files.logoFile[0].filename}`;
      }
      
      if (files.bannerFile) {
        partnerData.bannerUrl = `/uploads/partners/${files.bannerFile[0].filename}`;
      }
      
      if (files.contractFile) {
        partnerData.contractUrl = `/uploads/partners/${files.contractFile[0].filename}`;
      }
      
      // Atualizar parceiro
      const [updatedPartner] = await db
        .update(socialPartners)
        .set({
          ...partnerData,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(socialPartners.id, parseInt(id)),
            eq(socialPartners.organizationId, organizationId)
          )
        )
        .returning();
      
      res.json({
        message: "Parceiro atualizado com sucesso!",
        partner: updatedPartner
      });
    } catch (error) {
      console.error("Erro ao atualizar parceiro:", error);
      res.status(500).json({ message: "Erro ao atualizar parceiro" });
    }
});

// Rota para atualizar status do parceiro
socialPartnersRouter.patch("/:id/status", ensureJsonResponse, authenticate, isAssociation, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const organizationId = req.user.organizationId;
    
    if (!status || !["active", "inactive", "pending"].includes(status)) {
      return res.status(400).json({ message: "Status inválido" });
    }
    
    // Verificar se o parceiro existe
    const [existingPartner] = await db
      .select()
      .from(socialPartners)
      .where(
        and(
          eq(socialPartners.id, parseInt(id)),
          eq(socialPartners.organizationId, organizationId)
        )
      );
    
    if (!existingPartner) {
      return res.status(404).json({ message: "Parceiro não encontrado" });
    }
    
    // Atualizar status
    const [updatedPartner] = await db
      .update(socialPartners)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(socialPartners.id, parseInt(id)),
          eq(socialPartners.organizationId, organizationId)
        )
      )
      .returning();
    
    res.json({
      message: `Parceiro ${status === "active" ? "ativado" : status === "inactive" ? "desativado" : "marcado como pendente"} com sucesso!`,
      partner: updatedPartner
    });
  } catch (error) {
    console.error("Erro ao atualizar status do parceiro:", error);
    res.status(500).json({ message: "Erro ao atualizar status do parceiro" });
  }
});

// Rota para adicionar benefício a um parceiro
socialPartnersRouter.post("/:id/benefits", ensureJsonResponse, authenticate, isAssociation, upload.single("imageFile"), async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    const benefitData = req.body;
    
    // Verificar se o parceiro existe
    const [partner] = await db
      .select()
      .from(socialPartners)
      .where(
        and(
          eq(socialPartners.id, parseInt(id)),
          eq(socialPartners.organizationId, organizationId)
        )
      );
    
    if (!partner) {
      return res.status(404).json({ message: "Parceiro não encontrado" });
    }
    
    // Adicionar URL da imagem, se enviada
    if (req.file) {
      benefitData.imageUrl = `/uploads/partners/${req.file.filename}`;
    }
    
    // Validar dados recebidos
    const parsedData = insertSocialPartnerBenefitSchema.safeParse({
      ...benefitData,
      partnerId: parseInt(id),
      organizationId,
      discountValue: parseFloat(benefitData.discountValue),
      minimumPurchase: benefitData.minimumPurchase ? parseFloat(benefitData.minimumPurchase) : undefined,
      maxUsesTotal: benefitData.maxUsesTotal ? parseInt(benefitData.maxUsesTotal) : undefined,
      maxUsesPerMember: benefitData.maxUsesPerMember ? parseInt(benefitData.maxUsesPerMember) : 1,
      isActive: benefitData.isActive === "true" || benefitData.isActive === true
    });
    
    if (!parsedData.success) {
      return res.status(400).json({ 
        message: "Dados de benefício inválidos", 
        errors: parsedData.error.errors 
      });
    }
    
    // Criar benefício
    const [newBenefit] = await db
      .insert(socialPartnerBenefits)
      .values(parsedData.data)
      .returning();
    
    res.status(201).json({
      message: "Benefício adicionado com sucesso!",
      benefit: newBenefit
    });
  } catch (error) {
    console.error("Erro ao adicionar benefício:", error);
    res.status(500).json({ message: "Erro ao adicionar benefício" });
  }
});

// Rota para atualizar benefício
socialPartnersRouter.put("/benefits/:benefitId", authenticate, isAssociation, upload.single("imageFile"), async (req, res) => {
  try {
    const { benefitId } = req.params;
    const organizationId = req.user.organizationId;
    const benefitData = req.body;
    
    // Verificar se o benefício existe
    const [existingBenefit] = await db
      .select()
      .from(socialPartnerBenefits)
      .where(
        and(
          eq(socialPartnerBenefits.id, parseInt(benefitId)),
          eq(socialPartnerBenefits.organizationId, organizationId)
        )
      );
    
    if (!existingBenefit) {
      return res.status(404).json({ message: "Benefício não encontrado" });
    }
    
    // Adicionar URL da imagem, se enviada
    if (req.file) {
      benefitData.imageUrl = `/uploads/partners/${req.file.filename}`;
    }
    
    // Preparar dados para atualização
    const updateData = {
      ...benefitData,
      discountValue: benefitData.discountValue ? parseFloat(benefitData.discountValue) : existingBenefit.discountValue,
      minimumPurchase: benefitData.minimumPurchase ? parseFloat(benefitData.minimumPurchase) : existingBenefit.minimumPurchase,
      maxUsesTotal: benefitData.maxUsesTotal ? parseInt(benefitData.maxUsesTotal) : existingBenefit.maxUsesTotal,
      maxUsesPerMember: benefitData.maxUsesPerMember ? parseInt(benefitData.maxUsesPerMember) : existingBenefit.maxUsesPerMember,
      isActive: benefitData.isActive === undefined ? existingBenefit.isActive : (benefitData.isActive === "true" || benefitData.isActive === true),
      updatedAt: new Date()
    };
    
    // Atualizar benefício
    const [updatedBenefit] = await db
      .update(socialPartnerBenefits)
      .set(updateData)
      .where(
        and(
          eq(socialPartnerBenefits.id, parseInt(benefitId)),
          eq(socialPartnerBenefits.organizationId, organizationId)
        )
      )
      .returning();
    
    res.json({
      message: "Benefício atualizado com sucesso!",
      benefit: updatedBenefit
    });
  } catch (error) {
    console.error("Erro ao atualizar benefício:", error);
    res.status(500).json({ message: "Erro ao atualizar benefício" });
  }
});

// Rota para listar todos os benefícios ativos (para membros)
socialPartnersRouter.get("/benefits/active", authenticate, async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { category } = req.query;
    
    // Construir query para buscar parceiros ativos e seus benefícios
    let query = db
      .select({
        benefit: socialPartnerBenefits,
        partner: {
          id: socialPartners.id,
          name: socialPartners.name,
          category: socialPartners.category,
          logoUrl: socialPartners.logoUrl,
          address: socialPartners.address,
          city: socialPartners.city,
          state: socialPartners.state
        }
      })
      .from(socialPartnerBenefits)
      .innerJoin(
        socialPartners,
        and(
          eq(socialPartnerBenefits.partnerId, socialPartners.id),
          eq(socialPartners.status, "active")
        )
      )
      .where(
        and(
          eq(socialPartnerBenefits.organizationId, organizationId),
          eq(socialPartnerBenefits.isActive, true)
        )
      );
    
    // Filtrar por categoria de parceiro se especificado
    if (category) {
      query = query.where(eq(socialPartners.category, category));
    }
    
    const activeBenefits = await query;
    
    res.json(activeBenefits);
  } catch (error) {
    console.error("Erro ao listar benefícios ativos:", error);
    res.status(500).json({ message: "Erro ao listar benefícios ativos" });
  }
});

// Rota para registrar uso de benefício
socialPartnersRouter.post("/benefits/:benefitId/use", authenticate, async (req, res) => {
  try {
    const { benefitId } = req.params;
    const { cardId, usageMethod, usageValue } = req.body;
    const userId = req.user.id;
    const organizationId = req.user.organizationId;
    
    // Verificar se o benefício existe e está ativo
    const [benefit] = await db
      .select()
      .from(socialPartnerBenefits)
      .innerJoin(
        socialPartners,
        and(
          eq(socialPartnerBenefits.partnerId, socialPartners.id),
          eq(socialPartners.status, "active")
        )
      )
      .where(
        and(
          eq(socialPartnerBenefits.id, parseInt(benefitId)),
          eq(socialPartnerBenefits.organizationId, organizationId),
          eq(socialPartnerBenefits.isActive, true)
        )
      );
    
    if (!benefit) {
      return res.status(404).json({ message: "Benefício não encontrado ou inativo" });
    }
    
    // Verificar se o usuário já atingiu o limite de usos
    if (benefit.socialPartnerBenefits.maxUsesPerMember) {
      const usageCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(socialBenefitUsage)
        .where(
          and(
            eq(socialBenefitUsage.benefitId, parseInt(benefitId)),
            eq(socialBenefitUsage.beneficiaryId, userId)
          )
        );
      
      if (usageCount[0].count >= benefit.socialPartnerBenefits.maxUsesPerMember) {
        return res.status(400).json({ 
          message: `Limite de ${benefit.socialPartnerBenefits.maxUsesPerMember} uso(s) para este benefício atingido` 
        });
      }
    }
    
    // Verificar se o benefício já atingiu o limite total de usos
    if (benefit.socialPartnerBenefits.maxUsesTotal) {
      const usageCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(socialBenefitUsage)
        .where(eq(socialBenefitUsage.benefitId, parseInt(benefitId)));
      
      if (usageCount[0].count >= benefit.socialPartnerBenefits.maxUsesTotal) {
        return res.status(400).json({ 
          message: "Limite total de usos para este benefício atingido" 
        });
      }
    }
    
    // Gerar código de verificação
    const verificationCode = generateVerificationCode();
    
    // Registrar uso do benefício
    const [benefitUsage] = await db
      .insert(socialBenefitUsage)
      .values({
        benefitId: parseInt(benefitId),
        beneficiaryId: userId,
        organizationId,
        cardId: cardId ? parseInt(cardId) : undefined,
        usageValue: usageValue ? parseFloat(usageValue) : undefined,
        usageMethod: usageMethod || "qr_code",
        verificationCode,
        status: "completed"
      })
      .returning();
    
    res.status(201).json({
      message: "Benefício utilizado com sucesso!",
      usage: benefitUsage,
      verificationCode
    });
  } catch (error) {
    console.error("Erro ao registrar uso de benefício:", error);
    res.status(500).json({ message: "Erro ao registrar uso de benefício" });
  }
});

// Rota para verificar uso de benefício por código
socialPartnersRouter.get("/benefits/verify/:code", async (req, res) => {
  try {
    const { code } = req.params;
    
    // Buscar uso de benefício pelo código de verificação
    const [usage] = await db
      .select({
        usage: socialBenefitUsage,
        benefit: socialPartnerBenefits,
        partner: {
          id: socialPartners.id,
          name: socialPartners.name,
          category: socialPartners.category
        }
      })
      .from(socialBenefitUsage)
      .innerJoin(
        socialPartnerBenefits,
        eq(socialBenefitUsage.benefitId, socialPartnerBenefits.id)
      )
      .innerJoin(
        socialPartners,
        eq(socialPartnerBenefits.partnerId, socialPartners.id)
      )
      .where(eq(socialBenefitUsage.verificationCode, code));
    
    if (!usage) {
      return res.status(404).json({ message: "Código de verificação inválido" });
    }
    
    // Verificar se o uso já foi cancelado
    if (usage.usage.status === "cancelled") {
      return res.status(400).json({ message: "Este código já foi cancelado", usage });
    }
    
    res.json({
      message: "Código verificado com sucesso!",
      usage
    });
  } catch (error) {
    console.error("Erro ao verificar código:", error);
    res.status(500).json({ message: "Erro ao verificar código" });
  }
});

// Rota para cancelar uso de benefício
socialPartnersRouter.post("/benefits/usage/:usageId/cancel", authenticate, isAssociation, async (req, res) => {
  try {
    const { usageId } = req.params;
    const { reason } = req.body;
    const organizationId = req.user.organizationId;
    
    // Verificar se o uso existe
    const [usage] = await db
      .select()
      .from(socialBenefitUsage)
      .where(
        and(
          eq(socialBenefitUsage.id, parseInt(usageId)),
          eq(socialBenefitUsage.organizationId, organizationId)
        )
      );
    
    if (!usage) {
      return res.status(404).json({ message: "Uso de benefício não encontrado" });
    }
    
    // Verificar se o uso já foi cancelado
    if (usage.status === "cancelled") {
      return res.status(400).json({ message: "Este uso já foi cancelado" });
    }
    
    // Cancelar uso
    const [cancelledUsage] = await db
      .update(socialBenefitUsage)
      .set({
        status: "cancelled",
        notes: reason || "Cancelado pelo administrador"
      })
      .where(eq(socialBenefitUsage.id, parseInt(usageId)))
      .returning();
    
    res.json({
      message: "Uso de benefício cancelado com sucesso!",
      usage: cancelledUsage
    });
  } catch (error) {
    console.error("Erro ao cancelar uso de benefício:", error);
    res.status(500).json({ message: "Erro ao cancelar uso de benefício" });
  }
});

// Rota para adicionar feedback e classificação a um uso de benefício
socialPartnersRouter.post("/benefits/usage/:usageId/feedback", authenticate, async (req, res) => {
  try {
    const { usageId } = req.params;
    const { feedback, rating } = req.body;
    const userId = req.user.id;
    const organizationId = req.user.organizationId;
    
    // Verificar se o uso existe e pertence ao usuário
    const [usage] = await db
      .select()
      .from(socialBenefitUsage)
      .where(
        and(
          eq(socialBenefitUsage.id, parseInt(usageId)),
          eq(socialBenefitUsage.beneficiaryId, userId),
          eq(socialBenefitUsage.organizationId, organizationId)
        )
      );
    
    if (!usage) {
      return res.status(404).json({ message: "Uso de benefício não encontrado" });
    }
    
    // Adicionar feedback
    const [updatedUsage] = await db
      .update(socialBenefitUsage)
      .set({
        beneficiaryFeedback: feedback,
        beneficiaryRating: rating ? parseInt(rating) : undefined
      })
      .where(eq(socialBenefitUsage.id, parseInt(usageId)))
      .returning();
    
    res.json({
      message: "Feedback adicionado com sucesso!",
      usage: updatedUsage
    });
  } catch (error) {
    console.error("Erro ao adicionar feedback:", error);
    res.status(500).json({ message: "Erro ao adicionar feedback" });
  }
});

// Exportar o router
export { socialPartnersRouter };
export default socialPartnersRouter;