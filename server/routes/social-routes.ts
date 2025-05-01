import { Router } from "express";
import { db } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  socialBeneficiaries,
  socialDonations,
  socialExpenses,
  socialCampaigns,
  socialVolunteers,
  socialPortalSettings,
  socialBeneficiaryHistory
} from "../../shared/schema-social";
import { authenticate } from "../routes";
import multer from "multer";
import path from "path";
import fs from "fs";
import { socialBeneficiariesBatchRouter } from "./social-beneficiaries-batch";
import { socialBeneficiosRouter } from "./social-beneficios";
import socialMembershipCardsRouter from "./social-membership-cards";
import socialPartnersRouter from "./social-partners";

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join("uploads", "social");
      
      // Criar diretório de uploads se não existir
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, "social-" + uniqueSuffix + ext);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Tipo de arquivo não suportado. Apenas JPEG, PNG e PDF são permitidos."));
    }
  },
});

const router = Router();

// Middleware para verificar se o usuário é de uma organização do tipo associação
const isAssociation = async (req, res, next) => {
  // O middleware authenticate já deve ter sido chamado antes deste
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  if (!req.session.user.organizationId) {
    return res.status(403).json({ message: "Usuário não está vinculado a uma organização" });
  }

  try {
    const [organization] = await db
      .select({ type: sql<string>`type` })
      .from(sql`organizations`)
      .where(sql`id = ${req.session.user.organizationId}`);

    if (!organization || organization.type !== "Associação") {
      return res.status(403).json({ message: "Este módulo é exclusivo para associações" });
    }

    next();
  } catch (error) {
    console.error("Erro ao verificar tipo de organização:", error);
    res.status(500).json({ message: "Erro ao verificar tipo de organização" });
  }
};

// Rotas para beneficiários
router.get("/social/beneficiaries", authenticate, isAssociation, async (req, res) => {
  try {
    const organizationId = req.session.user.organizationId;
    
    const beneficiaries = await db
      .select()
      .from(socialBeneficiaries)
      .where(eq(socialBeneficiaries.organizationId, organizationId))
      .orderBy(desc(socialBeneficiaries.createdAt));
    
    res.json(beneficiaries);
  } catch (error) {
    console.error("Erro ao buscar beneficiários:", error);
    res.status(500).json({ message: "Erro ao buscar beneficiários" });
  }
});

router.get("/social/beneficiaries/:id", authenticate, isAssociation, async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.session.user.organizationId;
    
    const [beneficiary] = await db
      .select()
      .from(socialBeneficiaries)
      .where(
        and(
          eq(socialBeneficiaries.id, parseInt(id)),
          eq(socialBeneficiaries.organizationId, organizationId)
        )
      );
    
    if (!beneficiary) {
      return res.status(404).json({ message: "Beneficiário não encontrado" });
    }
    
    // Buscar histórico do beneficiário
    const history = await db
      .select()
      .from(socialBeneficiaryHistory)
      .where(
        and(
          eq(socialBeneficiaryHistory.beneficiaryId, parseInt(id)),
          eq(socialBeneficiaryHistory.organizationId, organizationId)
        )
      )
      .orderBy(desc(socialBeneficiaryHistory.eventDate));
    
    res.json({ beneficiary, history });
  } catch (error) {
    console.error("Erro ao buscar detalhes do beneficiário:", error);
    res.status(500).json({ message: "Erro ao buscar detalhes do beneficiário" });
  }
});

// Upload de documentos para beneficiários
router.post(
  "/social/beneficiaries/documents",
  authenticate,
  isAssociation,
  upload.fields([
    { name: "documentFront", maxCount: 1 },
    { name: "documentBack", maxCount: 1 },
    { name: "proofOfIncome", maxCount: 1 },
    { name: "proofOfResidence", maxCount: 1 },
    { name: "medicalReport", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const beneficiaryId = req.body.beneficiaryId;
      const organizationId = req.session.user.organizationId;
      
      const updateData = {};
      
      // Adicionar caminhos dos arquivos ao objeto de atualização
      if (files.documentFront) {
        updateData["documentFront"] = files.documentFront[0].path;
      }
      
      if (files.documentBack) {
        updateData["documentBack"] = files.documentBack[0].path;
      }
      
      if (files.proofOfIncome) {
        updateData["proofOfIncome"] = files.proofOfIncome[0].path;
      }
      
      if (files.proofOfResidence) {
        updateData["proofOfResidence"] = files.proofOfResidence[0].path;
      }
      
      if (files.medicalReport) {
        updateData["medicalReport"] = files.medicalReport[0].path;
      }
      
      // Atualizar o beneficiário com os caminhos dos arquivos
      if (Object.keys(updateData).length > 0) {
        const [updated] = await db
          .update(socialBeneficiaries)
          .set(updateData)
          .where(
            and(
              eq(socialBeneficiaries.id, parseInt(beneficiaryId)),
              eq(socialBeneficiaries.organizationId, organizationId)
            )
          )
          .returning();
        
        res.json({ message: "Documentos enviados com sucesso", beneficiary: updated });
      } else {
        res.status(400).json({ message: "Nenhum documento enviado" });
      }
    } catch (error) {
      console.error("Erro ao enviar documentos:", error);
      res.status(500).json({ message: "Erro ao enviar documentos" });
    }
  }
);

router.post("/social/beneficiaries", authenticate, isAssociation, async (req, res) => {
  try {
    const organizationId = req.session.user.organizationId;
    const beneficiaryData = { ...req.body, organizationId };
    
    // Criar beneficiário
    const [newBeneficiary] = await db
      .insert(socialBeneficiaries)
      .values(beneficiaryData)
      .returning();
    
    // Criar primeiro registro no histórico
    await db.insert(socialBeneficiaryHistory).values({
      beneficiaryId: newBeneficiary.id,
      organizationId,
      eventType: "registration",
      description: "Cadastro inicial no programa social",
      createdBy: req.session.user.id
    });
    
    res.status(201).json(newBeneficiary);
  } catch (error) {
    console.error("Erro ao criar beneficiário:", error);
    res.status(500).json({ message: "Erro ao criar beneficiário" });
  }
});

router.put("/social/beneficiaries/:id", authenticate, isAssociation, async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.session.user.organizationId;
    const beneficiaryData = req.body;
    
    // Verificar se houve alteração no tipo de isenção
    const [currentBeneficiary] = await db
      .select()
      .from(socialBeneficiaries)
      .where(
        and(
          eq(socialBeneficiaries.id, parseInt(id)),
          eq(socialBeneficiaries.organizationId, organizationId)
        )
      );
    
    if (!currentBeneficiary) {
      return res.status(404).json({ message: "Beneficiário não encontrado" });
    }
    
    // Atualizar beneficiário
    const [updated] = await db
      .update(socialBeneficiaries)
      .set(beneficiaryData)
      .where(
        and(
          eq(socialBeneficiaries.id, parseInt(id)),
          eq(socialBeneficiaries.organizationId, organizationId)
        )
      )
      .returning();
    
    // Registrar no histórico se houve alteração no tipo de isenção
    if (currentBeneficiary.exemptionType !== beneficiaryData.exemptionType) {
      await db.insert(socialBeneficiaryHistory).values({
        beneficiaryId: parseInt(id),
        organizationId,
        eventType: "exemption_change",
        description: `Alteração de isenção de ${currentBeneficiary.exemptionValue}% para ${beneficiaryData.exemptionValue}%`,
        createdBy: req.session.user.id
      });
    }
    
    res.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar beneficiário:", error);
    res.status(500).json({ message: "Erro ao atualizar beneficiário" });
  }
});

// Rotas para doações
router.get("/social/donations", authenticate, isAssociation, async (req, res) => {
  try {
    const organizationId = req.session.user.organizationId;
    
    const donations = await db
      .select()
      .from(socialDonations)
      .where(eq(socialDonations.organizationId, organizationId))
      .orderBy(desc(socialDonations.donationDate));
    
    res.json(donations);
  } catch (error) {
    console.error("Erro ao buscar doações:", error);
    res.status(500).json({ message: "Erro ao buscar doações" });
  }
});

router.post("/social/donations", authenticate, isAssociation, async (req, res) => {
  try {
    const organizationId = req.session.user.organizationId;
    const donationData = { ...req.body, organizationId };
    
    const [newDonation] = await db
      .insert(socialDonations)
      .values(donationData)
      .returning();
    
    res.status(201).json(newDonation);
  } catch (error) {
    console.error("Erro ao registrar doação:", error);
    res.status(500).json({ message: "Erro ao registrar doação" });
  }
});

// Rotas para despesas
router.get("/social/expenses", authenticate, isAssociation, async (req, res) => {
  try {
    const organizationId = req.session.user.organizationId;
    
    const expenses = await db
      .select()
      .from(socialExpenses)
      .where(eq(socialExpenses.organizationId, organizationId))
      .orderBy(desc(socialExpenses.expenseDate));
    
    res.json(expenses);
  } catch (error) {
    console.error("Erro ao buscar despesas:", error);
    res.status(500).json({ message: "Erro ao buscar despesas" });
  }
});

router.post("/social/expenses", authenticate, isAssociation, async (req, res) => {
  try {
    const organizationId = req.session.user.organizationId;
    const expenseData = { ...req.body, organizationId };
    
    // Se a despesa estiver associada a um beneficiário, registrar no histórico
    if (expenseData.beneficiaryId) {
      await db.insert(socialBeneficiaryHistory).values({
        beneficiaryId: expenseData.beneficiaryId,
        organizationId,
        eventType: "expense",
        description: `Despesa: ${expenseData.description}`,
        amount: expenseData.amount,
        createdBy: req.session.user.id
      });
    }
    
    const [newExpense] = await db
      .insert(socialExpenses)
      .values(expenseData)
      .returning();
    
    res.status(201).json(newExpense);
  } catch (error) {
    console.error("Erro ao registrar despesa:", error);
    res.status(500).json({ message: "Erro ao registrar despesa" });
  }
});

// Rotas para campanhas
router.get("/social/campaigns", authenticate, isAssociation, async (req, res) => {
  try {
    const organizationId = req.session.user.organizationId;
    
    const campaigns = await db
      .select()
      .from(socialCampaigns)
      .where(eq(socialCampaigns.organizationId, organizationId))
      .orderBy(desc(socialCampaigns.createdAt));
    
    res.json(campaigns);
  } catch (error) {
    console.error("Erro ao buscar campanhas:", error);
    res.status(500).json({ message: "Erro ao buscar campanhas" });
  }
});

router.post("/social/campaigns", authenticate, isAssociation, async (req, res) => {
  try {
    const organizationId = req.session.user.organizationId;
    const campaignData = { ...req.body, organizationId };
    
    const [newCampaign] = await db
      .insert(socialCampaigns)
      .values(campaignData)
      .returning();
    
    res.status(201).json(newCampaign);
  } catch (error) {
    console.error("Erro ao criar campanha:", error);
    res.status(500).json({ message: "Erro ao criar campanha" });
  }
});

// Rotas para voluntários
router.get("/social/volunteers", authenticate, isAssociation, async (req, res) => {
  try {
    const organizationId = req.session.user.organizationId;
    
    const volunteers = await db
      .select()
      .from(socialVolunteers)
      .where(eq(socialVolunteers.organizationId, organizationId))
      .orderBy(desc(socialVolunteers.createdAt));
    
    res.json(volunteers);
  } catch (error) {
    console.error("Erro ao buscar voluntários:", error);
    res.status(500).json({ message: "Erro ao buscar voluntários" });
  }
});

router.post("/social/volunteers", authenticate, isAssociation, async (req, res) => {
  try {
    const organizationId = req.session.user.organizationId;
    const volunteerData = { ...req.body, organizationId };
    
    const [newVolunteer] = await db
      .insert(socialVolunteers)
      .values(volunteerData)
      .returning();
    
    res.status(201).json(newVolunteer);
  } catch (error) {
    console.error("Erro ao cadastrar voluntário:", error);
    res.status(500).json({ message: "Erro ao cadastrar voluntário" });
  }
});

// Rotas para configurações do portal social
router.get("/social/portal-settings", authenticate, isAssociation, async (req, res) => {
  try {
    const organizationId = req.session.user.organizationId;
    
    // Buscar configurações atuais ou criar padrão se não existirem
    let [settings] = await db
      .select()
      .from(socialPortalSettings)
      .where(eq(socialPortalSettings.organizationId, organizationId));
    
    if (!settings) {
      [settings] = await db
        .insert(socialPortalSettings)
        .values({
          organizationId,
          title: "Programa Social",
          subtitle: "Cuidando de quem mais precisa",
          mission: "Nosso programa social tem como objetivo principal garantir acesso ao tratamento com cannabis medicinal para pacientes em situação de vulnerabilidade socioeconômica."
        })
        .returning();
    }
    
    res.json(settings);
  } catch (error) {
    console.error("Erro ao buscar configurações do portal social:", error);
    res.status(500).json({ message: "Erro ao buscar configurações do portal social" });
  }
});

router.put("/social/portal-settings", authenticate, isAssociation, async (req, res) => {
  try {
    const organizationId = req.session.user.organizationId;
    const settingsData = req.body;
    
    // Verificar se já existem configurações
    const [existingSettings] = await db
      .select()
      .from(socialPortalSettings)
      .where(eq(socialPortalSettings.organizationId, organizationId));
    
    let updatedSettings;
    
    if (existingSettings) {
      // Atualizar configurações existentes
      [updatedSettings] = await db
        .update(socialPortalSettings)
        .set(settingsData)
        .where(eq(socialPortalSettings.organizationId, organizationId))
        .returning();
    } else {
      // Criar novas configurações
      [updatedSettings] = await db
        .insert(socialPortalSettings)
        .values({ ...settingsData, organizationId })
        .returning();
    }
    
    res.json(updatedSettings);
  } catch (error) {
    console.error("Erro ao atualizar configurações do portal social:", error);
    res.status(500).json({ message: "Erro ao atualizar configurações do portal social" });
  }
});

// Rota para dados do dashboard
router.get("/social/dashboard", authenticate, isAssociation, async (req, res) => {
  try {
    const organizationId = req.session.user.organizationId;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    
    // Total de beneficiários ativos
    const [beneficiariesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(socialBeneficiaries)
      .where(
        and(
          eq(socialBeneficiaries.organizationId, organizationId),
          eq(socialBeneficiaries.status, "active")
        )
      );
    
    // Total investido no ano
    const [totalInvested] = await db
      .select({ sum: sql<string>`COALESCE(sum(amount), 0)` })
      .from(socialExpenses)
      .where(
        and(
          eq(socialExpenses.organizationId, organizationId),
          sql`EXTRACT(YEAR FROM expense_date) = ${year}`
        )
      );
    
    // Total de doações recebidas no ano
    const [totalDonations] = await db
      .select({ sum: sql<string>`COALESCE(sum(amount), 0)` })
      .from(socialDonations)
      .where(
        and(
          eq(socialDonations.organizationId, organizationId),
          sql`EXTRACT(YEAR FROM donation_date) = ${year}`
        )
      );
    
    // Distribuição por tipo de isenção
    const exemptionDistribution = await db
      .select({
        exemptionType: socialBeneficiaries.exemptionType,
        count: sql<number>`count(*)`,
      })
      .from(socialBeneficiaries)
      .where(
        and(
          eq(socialBeneficiaries.organizationId, organizationId),
          eq(socialBeneficiaries.status, "active")
        )
      )
      .groupBy(socialBeneficiaries.exemptionType);
    
    // Média de isenção
    const [avgExemption] = await db
      .select({ avg: sql<string>`COALESCE(AVG(exemption_value), 0)` })
      .from(socialBeneficiaries)
      .where(
        and(
          eq(socialBeneficiaries.organizationId, organizationId),
          eq(socialBeneficiaries.status, "active")
        )
      );
    
    // Evolução mensal de beneficiários para o ano
    const monthlyBeneficiaries = [];
    
    for (let month = 1; month <= 12; month++) {
      const [count] = await db
        .select({ count: sql<number>`count(*)` })
        .from(socialBeneficiaries)
        .where(
          and(
            eq(socialBeneficiaries.organizationId, organizationId),
            sql`EXTRACT(YEAR FROM created_at) <= ${year}`,
            sql`EXTRACT(MONTH FROM created_at) <= ${month}`,
            eq(socialBeneficiaries.status, "active")
          )
        );
      
      monthlyBeneficiaries.push({
        month,
        count: count.count
      });
    }
    
    // Evolução mensal de investimentos para o ano
    const monthlyExpenses = [];
    
    for (let month = 1; month <= 12; month++) {
      const [sum] = await db
        .select({ sum: sql<string>`COALESCE(sum(amount), 0)` })
        .from(socialExpenses)
        .where(
          and(
            eq(socialExpenses.organizationId, organizationId),
            sql`EXTRACT(YEAR FROM expense_date) = ${year}`,
            sql`EXTRACT(MONTH FROM expense_date) = ${month}`
          )
        );
      
      monthlyExpenses.push({
        month,
        amount: parseFloat(sum.sum)
      });
    }
    
    // Custo médio por beneficiário
    let avgCostPerBeneficiary = 0;
    if (beneficiariesCount.count > 0) {
      avgCostPerBeneficiary = parseFloat(totalInvested.sum) / beneficiariesCount.count;
    }
    
    res.json({
      beneficiariesCount: beneficiariesCount.count,
      totalInvested: parseFloat(totalInvested.sum),
      totalDonations: parseFloat(totalDonations.sum),
      exemptionDistribution,
      avgExemption: parseFloat(avgExemption.avg),
      monthlyBeneficiaries,
      monthlyExpenses,
      avgCostPerBeneficiary,
      year
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    res.status(500).json({ message: "Erro ao buscar dados do dashboard" });
  }
});

// Rota pública para o portal social
router.get("/public/social/:organizationId", async (req, res) => {
  try {
    const { organizationId } = req.params;
    
    // Buscar informações da organização
    const [organization] = await db
      .select({
        id: sql<number>`id`,
        name: sql<string>`name`,
        type: sql<string>`type`,
        logo: sql<string>`logo`,
      })
      .from(sql`organizations`)
      .where(sql`id = ${parseInt(organizationId)}`);
    
    if (!organization || organization.type !== "Associação") {
      return res.status(404).json({ message: "Organização não encontrada ou não é uma associação" });
    }
    
    // Buscar configurações do portal
    const [portalSettings] = await db
      .select()
      .from(socialPortalSettings)
      .where(eq(socialPortalSettings.organizationId, parseInt(organizationId)));
    
    // Buscar estatísticas básicas
    const [beneficiariesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(socialBeneficiaries)
      .where(
        and(
          eq(socialBeneficiaries.organizationId, parseInt(organizationId)),
          eq(socialBeneficiaries.status, "active")
        )
      );
    
    // Buscar campanhas ativas
    const activeCampaigns = await db
      .select()
      .from(socialCampaigns)
      .where(
        and(
          eq(socialCampaigns.organizationId, parseInt(organizationId)),
          eq(socialCampaigns.isActive, true)
        )
      )
      .orderBy(desc(socialCampaigns.createdAt))
      .limit(3);
    
    res.json({
      organization,
      portalSettings: portalSettings || {
        title: "Programa Social",
        subtitle: "Cuidando de quem mais precisa",
        mission: "Nosso programa social tem como objetivo principal garantir acesso ao tratamento com cannabis medicinal para pacientes em situação de vulnerabilidade socioeconômica."
      },
      stats: {
        beneficiariesCount: beneficiariesCount.count
      },
      activeCampaigns
    });
  } catch (error) {
    console.error("Erro ao buscar informações do portal social:", error);
    res.status(500).json({ message: "Erro ao buscar informações do portal social" });
  }
});

// Rota pública para cadastro de beneficiários
router.post("/public/social/:organizationId/beneficiary-request", async (req, res) => {
  try {
    const { organizationId } = req.params;
    const beneficiaryData = { ...req.body, organizationId: parseInt(organizationId), status: "pending" };
    
    // Verificar se o CPF já está cadastrado
    const [existingBeneficiary] = await db
      .select()
      .from(socialBeneficiaries)
      .where(
        and(
          eq(socialBeneficiaries.cpf, beneficiaryData.cpf),
          eq(socialBeneficiaries.organizationId, parseInt(organizationId))
        )
      );
    
    if (existingBeneficiary) {
      return res.status(400).json({ message: "CPF já cadastrado no programa social" });
    }
    
    // Criar solicitação de beneficiário (status pendente)
    const [newBeneficiary] = await db
      .insert(socialBeneficiaries)
      .values(beneficiaryData)
      .returning();
    
    // Criar registro no histórico
    await db.insert(socialBeneficiaryHistory).values({
      beneficiaryId: newBeneficiary.id,
      organizationId: parseInt(organizationId),
      eventType: "request",
      description: "Solicitação de inclusão no programa social",
    });
    
    res.status(201).json({
      message: "Solicitação enviada com sucesso. Em breve entraremos em contato.",
      requestId: newBeneficiary.id
    });
  } catch (error) {
    console.error("Erro ao enviar solicitação:", error);
    res.status(500).json({ message: "Erro ao enviar solicitação" });
  }
});

// Rota pública para cadastro de voluntários
router.post("/public/social/:organizationId/volunteer-request", async (req, res) => {
  try {
    const { organizationId } = req.params;
    const volunteerData = { ...req.body, organizationId: parseInt(organizationId), status: "pending" };
    
    // Criar solicitação de voluntário (status pendente)
    const [newVolunteer] = await db
      .insert(socialVolunteers)
      .values(volunteerData)
      .returning();
    
    res.status(201).json({
      message: "Cadastro de voluntário enviado com sucesso. Em breve entraremos em contato.",
      volunteerId: newVolunteer.id
    });
  } catch (error) {
    console.error("Erro ao cadastrar voluntário:", error);
    res.status(500).json({ message: "Erro ao cadastrar voluntário" });
  }
});

// Middleware para garantir que todas as rotas de carteirinha retornem formato JSON em caso de não autorização
const ensureCarteirinhaJsonResponse = (req: any, res: any, next: any) => {
  // Força o Content-Type como application/json para todas as respostas
  res.set('Content-Type', 'application/json');
  
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      message: "Não autenticado",
      error: "Unauthorized",
      authenticated: false
    });
  }
  next();
};

// Aplicar middleware a todas as rotas do módulo carteirinha
router.use('/carteirinha', ensureCarteirinhaJsonResponse);

// Utilizar o router de importação em lote
router.use('/carteirinha/beneficiaries', socialBeneficiariesBatchRouter);

// Utilizar o router de benefícios
router.use('/carteirinha/beneficios', socialBeneficiosRouter);

// Utilizar o router de carteirinhas
router.use('/carteirinha/membership-cards', socialMembershipCardsRouter);

// Utilizar o router de parceiros e clube de benefícios
router.use('/carteirinha/partners', socialPartnersRouter);

export default router;