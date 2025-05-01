import { Router } from "express";
import { db } from "../db";
import { eq, and, desc, sql, or, ilike, like, gt, lt } from "drizzle-orm";
import {
  socialMembershipCards,
  socialMembershipCardSettings,
  socialMembershipCardAccessLogs,
  socialBeneficiaries,
  insertSocialMembershipCardSchema,
  insertSocialMembershipCardSettingsSchema,
  insertSocialMembershipCardAccessLogSchema
} from "../../shared/schema-social";
import { authenticate } from "../routes";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import QRCode from "qrcode";
import { createCanvas, loadImage, registerFont } from "canvas";

// Configuração para upload de fotos dos associados
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/membership-cards');
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
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Apenas imagens nos formatos .jpg, .jpeg ou .png são permitidas."));
  },
});

// Função para verificar se o usuário é admin de associação
function isAssociation(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  if (req.user.role !== 'org_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ message: "Acesso negado. Apenas administradores de associações podem gerenciar carteirinhas." });
  }

  next();
}

// Função para validar PIN
function validatePin(pin, options = { requireLetters: false, requireSpecialChars: false, minLength: 6 }) {
  // Verificar tamanho mínimo
  if (pin.length < options.minLength) {
    return { valid: false, message: `O PIN deve ter pelo menos ${options.minLength} caracteres.` };
  }

  // Verificar se contém apenas números
  if (!options.requireLetters && !options.requireSpecialChars) {
    const numberPattern = /^\d+$/;
    if (!numberPattern.test(pin)) {
      return { valid: false, message: "O PIN deve conter apenas números." };
    }
  }

  // Verificar se contém letras quando necessário
  if (options.requireLetters) {
    const letterPattern = /[a-zA-Z]/;
    if (!letterPattern.test(pin)) {
      return { valid: false, message: "O PIN deve conter pelo menos uma letra." };
    }
  }

  // Verificar se contém caracteres especiais quando necessário
  if (options.requireSpecialChars) {
    const specialCharPattern = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (!specialCharPattern.test(pin)) {
      return { valid: false, message: "O PIN deve conter pelo menos um caractere especial." };
    }
  }

  return { valid: true };
}

// Função para encriptar o PIN
async function encryptPin(pin) {
  const saltRounds = 10;
  return bcrypt.hash(pin, saltRounds);
}

// Função para verificar o PIN
async function verifyPin(plainPin, hashedPin) {
  return bcrypt.compare(plainPin, hashedPin);
}

// Função para gerar número da carteirinha
function generateCardNumber(beneficiaryId, organizationId) {
  const orgPrefix = organizationId.toString().padStart(4, '0');
  const beneficiaryNumber = beneficiaryId.toString().padStart(6, '0');
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${orgPrefix}-${beneficiaryNumber}-${randomSuffix}`;
}

// Função para gerar QR Code
async function generateQRCode(data) {
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 300,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
}

// Criar o router
export const socialMembershipCardsRouter = Router();

// Rota para listar carteirinhas
socialMembershipCardsRouter.get("/", authenticate, isAssociation, async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { status, cardType, query, page = 1, limit = 20 } = req.query;
    
    // Construir a query base
    let dbQuery = db
      .select({
        card: socialMembershipCards,
        beneficiary: {
          name: socialBeneficiaries.name,
          cpf: socialBeneficiaries.cpf,
        }
      })
      .from(socialMembershipCards)
      .innerJoin(
        socialBeneficiaries,
        eq(socialMembershipCards.beneficiaryId, socialBeneficiaries.id)
      )
      .where(eq(socialMembershipCards.organizationId, organizationId))
      .orderBy(desc(socialMembershipCards.createdAt))
      .limit(parseInt(limit as string))
      .offset((parseInt(page as string) - 1) * parseInt(limit as string));
    
    // Adicionar filtros opcionais
    if (status) {
      dbQuery = dbQuery.where(eq(socialMembershipCards.status, status));
    }
    
    if (cardType) {
      dbQuery = dbQuery.where(eq(socialMembershipCards.cardType, cardType));
    }
    
    if (query) {
      const searchTerm = `%${query}%`;
      dbQuery = dbQuery.where(
        or(
          ilike(socialBeneficiaries.name, searchTerm),
          ilike(socialBeneficiaries.cpf, searchTerm),
          ilike(socialMembershipCards.cardNumber, searchTerm)
        )
      );
    }
    
    // Contar total de registros para paginação
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(socialMembershipCards)
      .innerJoin(
        socialBeneficiaries,
        eq(socialMembershipCards.beneficiaryId, socialBeneficiaries.id)
      )
      .where(eq(socialMembershipCards.organizationId, organizationId));
    
    // Aplicar os mesmos filtros à query de contagem
    if (status) {
      countQuery.where(eq(socialMembershipCards.status, status));
    }
    
    if (cardType) {
      countQuery.where(eq(socialMembershipCards.cardType, cardType));
    }
    
    if (query) {
      const searchTerm = `%${query}%`;
      countQuery.where(
        or(
          ilike(socialBeneficiaries.name, searchTerm),
          ilike(socialBeneficiaries.cpf, searchTerm),
          ilike(socialMembershipCards.cardNumber, searchTerm)
        )
      );
    }
    
    const [cards, totalResults] = await Promise.all([
      dbQuery,
      countQuery
    ]);
    
    res.json({
      data: cards,
      pagination: {
        total: totalResults[0].count,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(totalResults[0].count / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error("Erro ao listar carteirinhas:", error);
    res.status(500).json({ message: "Erro ao listar carteirinhas" });
  }
});

// Rota para obter detalhes de uma carteirinha específica
socialMembershipCardsRouter.get("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    // Buscar carteirinha
    const [card] = await db
      .select({
        card: socialMembershipCards,
        beneficiary: socialBeneficiaries,
        settings: socialMembershipCardSettings
      })
      .from(socialMembershipCards)
      .innerJoin(
        socialBeneficiaries,
        eq(socialMembershipCards.beneficiaryId, socialBeneficiaries.id)
      )
      .leftJoin(
        socialMembershipCardSettings,
        eq(socialMembershipCards.organizationId, socialMembershipCardSettings.organizationId)
      )
      .where(
        and(
          eq(socialMembershipCards.id, parseInt(id)),
          eq(socialMembershipCards.organizationId, organizationId)
        )
      );
    
    if (!card) {
      return res.status(404).json({ message: "Carteirinha não encontrada" });
    }
    
    // Buscar acessos recentes
    const recentAccess = await db
      .select()
      .from(socialMembershipCardAccessLogs)
      .where(eq(socialMembershipCardAccessLogs.cardId, parseInt(id)))
      .orderBy(desc(socialMembershipCardAccessLogs.accessDate))
      .limit(10);
    
    // Retornar carteirinha com detalhes
    res.json({ 
      ...card,
      recentAccess 
    });
  } catch (error) {
    console.error("Erro ao buscar detalhes da carteirinha:", error);
    res.status(500).json({ message: "Erro ao buscar detalhes da carteirinha" });
  }
});

// Rota para criar nova carteirinha
socialMembershipCardsRouter.post("/", authenticate, isAssociation, upload.single("photoFile"), async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const cardData = req.body;
    
    // Verificar se o beneficiário existe e pertence à organização
    const [beneficiary] = await db
      .select()
      .from(socialBeneficiaries)
      .where(
        and(
          eq(socialBeneficiaries.id, parseInt(cardData.beneficiaryId)),
          eq(socialBeneficiaries.organizationId, organizationId)
        )
      );
    
    if (!beneficiary) {
      return res.status(404).json({ message: "Beneficiário não encontrado" });
    }
    
    // Verificar se o beneficiário já possui uma carteirinha ativa
    const existingCard = await db
      .select()
      .from(socialMembershipCards)
      .where(
        and(
          eq(socialMembershipCards.beneficiaryId, parseInt(cardData.beneficiaryId)),
          eq(socialMembershipCards.organizationId, organizationId),
          or(
            eq(socialMembershipCards.status, "pending"),
            eq(socialMembershipCards.status, "approved"),
            eq(socialMembershipCards.status, "printed")
          )
        )
      );
    
    if (existingCard.length > 0) {
      return res.status(400).json({ message: "Este beneficiário já possui uma carteirinha ativa ou pendente" });
    }
    
    // Adicionar URL da foto, se enviada
    if (req.file) {
      cardData.photoUrl = `/uploads/membership-cards/${req.file.filename}`;
    }
    
    // Gerar número da carteirinha
    const cardNumber = generateCardNumber(beneficiary.id, organizationId);
    
    // Gerar QR Code
    const qrData = JSON.stringify({
      cardId: 0, // Será atualizado após a criação
      beneficiaryId: beneficiary.id,
      organizationId,
      cardNumber,
      timestamp: new Date().getTime()
    });
    
    const qrCode = await generateQRCode(qrData);
    
    // Salvar QR Code como imagem
    const qrFileName = `qr-${cardNumber}-${Date.now()}.png`;
    const qrPath = path.join(__dirname, '../../uploads/membership-cards', qrFileName);
    
    // Converter data URL para buffer
    const qrDataUrl = qrCode.split(',')[1];
    const qrBuffer = Buffer.from(qrDataUrl, 'base64');
    
    // Salvar imagem do QR Code
    fs.writeFileSync(qrPath, qrBuffer);
    
    // Buscar configurações da carteirinha
    let [settings] = await db
      .select()
      .from(socialMembershipCardSettings)
      .where(eq(socialMembershipCardSettings.organizationId, organizationId));
    
    // Se não existir configuração, usar valores padrão
    if (!settings) {
      settings = {
        id: 0,
        organizationId,
        cardTitleText: "Carteirinha de Associado",
        cardSubtitleText: "Associação de Pacientes",
        cardBackgroundColor: "#FFFFFF",
        cardTextColor: "#000000",
        cardHighlightColor: "#00AA00",
        includeQrCode: true,
        includePhoto: true,
        includeLogo: true,
        includeValidityDate: true,
        validityPeriodMonths: 12,
        physicalCardPrice: 25.00,
        physicalCardEnabled: true,
        pinEnabled: true,
        pinDigits: 6,
        pinRequireLetters: false,
        pinRequireSpecialChars: false,
        termsText: "Esta carteirinha é pessoal e intransferível. Em caso de perda ou roubo, comunique imediatamente.",
        cardTemplate: "default",
        customCss: null,
        customFields: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    // Calcular data de expiração (1 ano da geração por padrão)
    const issueDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + (settings.validityPeriodMonths || 12));
    
    // Criar carteirinha
    const [newCard] = await db
      .insert(socialMembershipCards)
      .values({
        beneficiaryId: parseInt(cardData.beneficiaryId),
        organizationId,
        cardType: cardData.cardType || "digital",
        status: "pending",
        cardNumber,
        qrCodeUrl: `/uploads/membership-cards/${qrFileName}`,
        issueDate,
        expiryDate,
        photoUrl: cardData.photoUrl,
        physicalCardRequested: cardData.physicalCardRequested === "true" || cardData.physicalCardRequested === true,
        notes: cardData.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    // Atualizar o QR Code com o ID da carteirinha
    const updatedQrData = JSON.stringify({
      cardId: newCard.id,
      beneficiaryId: beneficiary.id,
      organizationId,
      cardNumber,
      timestamp: new Date().getTime()
    });
    
    const updatedQrCode = await generateQRCode(updatedQrData);
    
    // Salvar QR Code atualizado
    const updatedQrBuffer = Buffer.from(updatedQrCode.split(',')[1], 'base64');
    fs.writeFileSync(qrPath, updatedQrBuffer);
    
    res.status(201).json({
      message: "Carteirinha criada com sucesso!",
      card: newCard
    });
  } catch (error) {
    console.error("Erro ao criar carteirinha:", error);
    res.status(500).json({ message: "Erro ao criar carteirinha" });
  }
});

// Rota para atualizar carteirinha
socialMembershipCardsRouter.put("/:id", authenticate, isAssociation, upload.single("photoFile"), async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    const cardData = req.body;
    
    // Verificar se a carteirinha existe
    const [existingCard] = await db
      .select()
      .from(socialMembershipCards)
      .where(
        and(
          eq(socialMembershipCards.id, parseInt(id)),
          eq(socialMembershipCards.organizationId, organizationId)
        )
      );
    
    if (!existingCard) {
      return res.status(404).json({ message: "Carteirinha não encontrada" });
    }
    
    // Adicionar URL da foto, se enviada
    if (req.file) {
      cardData.photoUrl = `/uploads/membership-cards/${req.file.filename}`;
    }
    
    // Atualizar carteirinha
    const [updatedCard] = await db
      .update(socialMembershipCards)
      .set({
        ...cardData,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(socialMembershipCards.id, parseInt(id)),
          eq(socialMembershipCards.organizationId, organizationId)
        )
      )
      .returning();
    
    res.json({
      message: "Carteirinha atualizada com sucesso!",
      card: updatedCard
    });
  } catch (error) {
    console.error("Erro ao atualizar carteirinha:", error);
    res.status(500).json({ message: "Erro ao atualizar carteirinha" });
  }
});

// Rota para atualizar status da carteirinha
socialMembershipCardsRouter.patch("/:id/status", authenticate, isAssociation, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const organizationId = req.user.organizationId;
    
    if (!status || !["pending", "approved", "printed", "delivered", "expired", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Status inválido" });
    }
    
    // Verificar se a carteirinha existe
    const [existingCard] = await db
      .select()
      .from(socialMembershipCards)
      .where(
        and(
          eq(socialMembershipCards.id, parseInt(id)),
          eq(socialMembershipCards.organizationId, organizationId)
        )
      );
    
    if (!existingCard) {
      return res.status(404).json({ message: "Carteirinha não encontrada" });
    }
    
    // Atualizar status
    const updateData = {
      status,
      updatedAt: new Date()
    };
    
    // Adicionar campos específicos conforme o status
    if (status === "printed") {
      updateData.printedAt = new Date();
    } else if (status === "delivered") {
      updateData.deliveredAt = new Date();
    }
    
    const [updatedCard] = await db
      .update(socialMembershipCards)
      .set(updateData)
      .where(
        and(
          eq(socialMembershipCards.id, parseInt(id)),
          eq(socialMembershipCards.organizationId, organizationId)
        )
      )
      .returning();
    
    // Mensagem personalizada conforme o status
    let message = "Status da carteirinha atualizado com sucesso!";
    if (status === "approved") {
      message = "Carteirinha aprovada com sucesso!";
    } else if (status === "printed") {
      message = "Carteirinha marcada como impressa!";
    } else if (status === "delivered") {
      message = "Carteirinha marcada como entregue!";
    } else if (status === "expired") {
      message = "Carteirinha marcada como expirada!";
    } else if (status === "cancelled") {
      message = "Carteirinha cancelada!";
    }
    
    res.json({
      message,
      card: updatedCard
    });
  } catch (error) {
    console.error("Erro ao atualizar status da carteirinha:", error);
    res.status(500).json({ message: "Erro ao atualizar status da carteirinha" });
  }
});

// Rota para configurar o PIN da carteirinha
socialMembershipCardsRouter.post("/:id/pin", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { pin } = req.body;
    const userId = req.user.id;
    const organizationId = req.user.organizationId;
    
    // Verificar se a carteirinha existe
    const [card] = await db
      .select()
      .from(socialMembershipCards)
      .where(
        and(
          eq(socialMembershipCards.id, parseInt(id)),
          eq(socialMembershipCards.organizationId, organizationId)
        )
      );
    
    if (!card) {
      return res.status(404).json({ message: "Carteirinha não encontrada" });
    }
    
    // Verificar se o usuário é o beneficiário ou um admin
    if (req.user.role !== 'org_admin' && req.user.role !== 'admin' && card.beneficiaryId !== userId) {
      return res.status(403).json({ message: "Acesso negado. Você não pode configurar o PIN desta carteirinha." });
    }
    
    // Verificar configurações de PIN
    const [settings] = await db
      .select()
      .from(socialMembershipCardSettings)
      .where(eq(socialMembershipCardSettings.organizationId, organizationId));
    
    // Validar PIN
    const pinOptions = {
      minLength: settings?.pinDigits || 6,
      requireLetters: settings?.pinRequireLetters || false,
      requireSpecialChars: settings?.pinRequireSpecialChars || false
    };
    
    const pinValidation = validatePin(pin, pinOptions);
    if (!pinValidation.valid) {
      return res.status(400).json({ message: pinValidation.message });
    }
    
    // Encriptar PIN
    const hashedPin = await encryptPin(pin);
    
    // Atualizar carteirinha
    const [updatedCard] = await db
      .update(socialMembershipCards)
      .set({
        pin: hashedPin,
        pinSetupCompleted: true,
        lastPinChangeDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(socialMembershipCards.id, parseInt(id)))
      .returning();
    
    res.json({
      message: "PIN configurado com sucesso!",
      card: {
        id: updatedCard.id,
        pinSetupCompleted: updatedCard.pinSetupCompleted,
        lastPinChangeDate: updatedCard.lastPinChangeDate
      }
    });
  } catch (error) {
    console.error("Erro ao configurar PIN:", error);
    res.status(500).json({ message: "Erro ao configurar PIN" });
  }
});

// Rota para verificar o PIN da carteirinha
socialMembershipCardsRouter.post("/:id/verify-pin", async (req, res) => {
  try {
    const { id } = req.params;
    const { pin } = req.body;
    
    // Buscar carteirinha
    const [card] = await db
      .select()
      .from(socialMembershipCards)
      .where(eq(socialMembershipCards.id, parseInt(id)));
    
    if (!card) {
      return res.status(404).json({ message: "Carteirinha não encontrada" });
    }
    
    // Verificar se o PIN foi configurado
    if (!card.pin || !card.pinSetupCompleted) {
      return res.status(400).json({ message: "PIN não configurado para esta carteirinha" });
    }
    
    // Verificar se a carteirinha está válida
    if (card.status === "expired" || card.status === "cancelled") {
      return res.status(400).json({ message: "Esta carteirinha está expirada ou cancelada" });
    }
    
    // Verificar se o PIN está correto
    const isPinValid = await verifyPin(pin, card.pin);
    
    if (!isPinValid) {
      return res.status(401).json({ message: "PIN incorreto" });
    }
    
    // Registrar acesso
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    await db
      .insert(socialMembershipCardAccessLogs)
      .values({
        cardId: card.id,
        organizationId: card.organizationId,
        accessDate: new Date(),
        accessIp: clientIp,
        accessUserAgent: userAgent,
        accessMethod: "pin_verification",
        pinVerified: true,
        createdAt: new Date()
      });
    
    res.json({
      success: true,
      message: "PIN verificado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao verificar PIN:", error);
    res.status(500).json({ message: "Erro ao verificar PIN" });
  }
});

// Rota para buscar carteirinha pelo QR Code
socialMembershipCardsRouter.get("/qr/:cardNumber", async (req, res) => {
  try {
    const { cardNumber } = req.params;
    
    // Buscar carteirinha
    const [card] = await db
      .select({
        card: socialMembershipCards,
        beneficiary: {
          name: socialBeneficiaries.name,
          cpf: socialBeneficiaries.cpf,
          email: socialBeneficiaries.email,
          phone: socialBeneficiaries.phone,
          status: socialBeneficiaries.status,
          membershipType: socialBeneficiaries.membershipType,
          membershipStartDate: socialBeneficiaries.membershipStartDate
        }
      })
      .from(socialMembershipCards)
      .innerJoin(
        socialBeneficiaries,
        eq(socialMembershipCards.beneficiaryId, socialBeneficiaries.id)
      )
      .where(eq(socialMembershipCards.cardNumber, cardNumber));
    
    if (!card) {
      return res.status(404).json({ message: "Carteirinha não encontrada" });
    }
    
    // Verificar se a carteirinha está válida
    if (card.card.status === "expired" || card.card.status === "cancelled" || card.beneficiary.status !== "active") {
      return res.status(400).json({ 
        message: "Esta carteirinha está expirada, cancelada ou o associado está inativo",
        card: {
          ...card.card,
          status: card.card.status === "expired" ? "expired" : 
                 card.card.status === "cancelled" ? "cancelled" : 
                 card.beneficiary.status !== "active" ? "inactive" : card.card.status
        },
        beneficiary: card.beneficiary
      });
    }
    
    // Verificar data de expiração
    const now = new Date();
    const expiryDate = new Date(card.card.expiryDate);
    
    if (now > expiryDate) {
      // Marcar carteirinha como expirada
      await db
        .update(socialMembershipCards)
        .set({
          status: "expired",
          updatedAt: new Date()
        })
        .where(eq(socialMembershipCards.id, card.card.id));
      
      return res.status(400).json({ 
        message: "Esta carteirinha está expirada",
        card: {
          ...card.card,
          status: "expired"
        },
        beneficiary: card.beneficiary
      });
    }
    
    // Registrar acesso
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    await db
      .insert(socialMembershipCardAccessLogs)
      .values({
        cardId: card.card.id,
        organizationId: card.card.organizationId,
        accessDate: new Date(),
        accessIp: clientIp,
        accessUserAgent: userAgent,
        accessMethod: "qr_scan",
        pinVerified: false, // PIN será verificado em outra etapa
        createdAt: new Date()
      });
    
    res.json({
      card: {
        id: card.card.id,
        cardNumber: card.card.cardNumber,
        status: card.card.status,
        expiryDate: card.card.expiryDate,
        issueDate: card.card.issueDate,
        photoUrl: card.card.photoUrl,
        cardType: card.card.cardType,
        organizationId: card.card.organizationId,
        pinEnabled: card.card.pin !== null && card.card.pinSetupCompleted
      },
      beneficiary: {
        name: card.beneficiary.name,
        cpf: card.beneficiary.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.***.$3-**"), // Mascarar CPF
        membershipType: card.beneficiary.membershipType,
        membershipStartDate: card.beneficiary.membershipStartDate
      }
    });
  } catch (error) {
    console.error("Erro ao buscar carteirinha por QR Code:", error);
    res.status(500).json({ message: "Erro ao buscar carteirinha por QR Code" });
  }
});

// Rota para gerar imagem da carteirinha
socialMembershipCardsRouter.get("/:id/generate-image", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    // Buscar carteirinha com beneficiário e configurações
    const [cardData] = await db
      .select({
        card: socialMembershipCards,
        beneficiary: socialBeneficiaries,
        settings: socialMembershipCardSettings
      })
      .from(socialMembershipCards)
      .innerJoin(
        socialBeneficiaries,
        eq(socialMembershipCards.beneficiaryId, socialBeneficiaries.id)
      )
      .leftJoin(
        socialMembershipCardSettings,
        eq(socialMembershipCards.organizationId, socialMembershipCardSettings.organizationId)
      )
      .where(
        and(
          eq(socialMembershipCards.id, parseInt(id)),
          eq(socialMembershipCards.organizationId, organizationId)
        )
      );
    
    if (!cardData) {
      return res.status(404).json({ message: "Carteirinha não encontrada" });
    }
    
    // Buscar logo da organização
    const [organization] = await db
      .select({
        name: sql<string>`name`,
        logo: sql<string>`logo`,
      })
      .from(sql`organizations`)
      .where(sql`id = ${organizationId}`);
    
    // Criar canvas para a carteirinha
    const width = 1000;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Configurar o estilo baseado nas configurações
    const settings = cardData.settings || {
      cardTitleText: "Carteirinha de Associado",
      cardSubtitleText: organization?.name || "Associação",
      cardBackgroundColor: "#FFFFFF",
      cardTextColor: "#000000",
      cardHighlightColor: "#22C55E",
      includeQrCode: true,
      includePhoto: true,
      includeLogo: true,
      includeValidityDate: true,
      termsText: "Esta carteirinha é pessoal e intransferível."
    };
    
    // Desenhar fundo
    ctx.fillStyle = settings.cardBackgroundColor || "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    
    // Adicionar borda
    ctx.strokeStyle = settings.cardHighlightColor || "#22C55E";
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    
    // Adicionar título
    ctx.fillStyle = settings.cardTextColor || "#000000";
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(settings.cardTitleText || "Carteirinha de Associado", width / 2, 60);
    
    // Adicionar subtítulo (nome da organização)
    ctx.font = 'bold 30px Arial';
    ctx.fillText(settings.cardSubtitleText || organization?.name || "Associação", width / 2, 100);
    
    // Adicionar informações do beneficiário
    ctx.textAlign = 'left';
    ctx.font = 'bold 30px Arial';
    ctx.fillText("Nome:", 30, 180);
    ctx.font = '28px Arial';
    ctx.fillText(cardData.beneficiary.name, 30, 220);
    
    ctx.font = 'bold 30px Arial';
    ctx.fillText("CPF:", 30, 270);
    ctx.font = '28px Arial';
    // Mascarar parte do CPF
    const maskedCpf = cardData.beneficiary.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    ctx.fillText(maskedCpf, 30, 310);
    
    // Adicionar tipo de associado
    ctx.font = 'bold 30px Arial';
    ctx.fillText("Tipo:", 30, 360);
    ctx.font = '28px Arial';
    const membershipType = cardData.beneficiary.membershipType === "regular" ? "Regular" :
                          cardData.beneficiary.membershipType === "premium" ? "Premium" :
                          cardData.beneficiary.membershipType === "lifetime" ? "Vitalício" :
                          cardData.beneficiary.membershipType === "temporary" ? "Temporário" :
                          "Associado";
    ctx.fillText(membershipType, 30, 400);
    
    // Adicionar número da carteirinha
    ctx.font = 'bold 24px Arial';
    ctx.fillText("Nº da Carteirinha:", 30, 450);
    ctx.font = '22px Arial';
    ctx.fillText(cardData.card.cardNumber, 30, 480);
    
    // Adicionar validade
    if (settings.includeValidityDate) {
      const expiryDate = new Date(cardData.card.expiryDate);
      const formattedDate = `${expiryDate.getDate().toString().padStart(2, '0')}/${(expiryDate.getMonth() + 1).toString().padStart(2, '0')}/${expiryDate.getFullYear()}`;
      
      ctx.font = 'bold 24px Arial';
      ctx.fillText("Validade:", 30, 520);
      ctx.font = '22px Arial';
      ctx.fillText(formattedDate, 30, 550);
    }
    
    // Adicionar QR Code
    if (settings.includeQrCode && cardData.card.qrCodeUrl) {
      try {
        const qrPath = path.join(__dirname, '../../', cardData.card.qrCodeUrl);
        const qrImage = await loadImage(qrPath);
        ctx.drawImage(qrImage, width - 230, 320, 200, 200);
      } catch (err) {
        console.error("Erro ao carregar QR Code:", err);
      }
    }
    
    // Adicionar foto do associado
    if (settings.includePhoto && cardData.card.photoUrl) {
      try {
        const photoPath = path.join(__dirname, '../../', cardData.card.photoUrl);
        const photo = await loadImage(photoPath);
        ctx.drawImage(photo, width - 250, 120, 200, 200);
      } catch (err) {
        console.error("Erro ao carregar foto:", err);
      }
    }
    
    // Adicionar logo da organização
    if (settings.includeLogo && organization?.logo) {
      try {
        const logoPath = path.join(__dirname, '../../uploads/logos/', organization.logo);
        const logo = await loadImage(logoPath);
        ctx.drawImage(logo, width - 150, 30, 120, 80);
      } catch (err) {
        console.error("Erro ao carregar logo:", err);
      }
    }
    
    // Adicionar termos
    ctx.font = 'italic 14px Arial';
    ctx.fillText(settings.termsText || "Esta carteirinha é pessoal e intransferível. Em caso de perda ou roubo, comunique imediatamente.", 30, height - 20);
    
    // Salvar imagem da carteirinha
    const cardImageFileName = `card-${cardData.card.cardNumber}-${Date.now()}.png`;
    const cardImagePath = path.join(__dirname, '../../uploads/membership-cards', cardImageFileName);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(cardImagePath, buffer);
    
    // Atualizar URL da imagem da carteirinha no banco
    await db
      .update(socialMembershipCards)
      .set({
        cardImageUrl: `/uploads/membership-cards/${cardImageFileName}`,
        updatedAt: new Date()
      })
      .where(eq(socialMembershipCards.id, parseInt(id)));
    
    res.json({
      message: "Imagem da carteirinha gerada com sucesso!",
      cardImageUrl: `/uploads/membership-cards/${cardImageFileName}`
    });
  } catch (error) {
    console.error("Erro ao gerar imagem da carteirinha:", error);
    res.status(500).json({ message: "Erro ao gerar imagem da carteirinha" });
  }
});

// Rota para obter ou criar configurações de carteirinha
socialMembershipCardsRouter.get("/settings/current", authenticate, isAssociation, async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    
    // Buscar configurações existentes
    let [settings] = await db
      .select()
      .from(socialMembershipCardSettings)
      .where(eq(socialMembershipCardSettings.organizationId, organizationId));
    
    if (!settings) {
      // Criar configurações padrão
      [settings] = await db
        .insert(socialMembershipCardSettings)
        .values({
          organizationId,
          cardTitleText: "Carteirinha de Associado",
          cardSubtitleText: "Associação de Pacientes",
          cardBackgroundColor: "#FFFFFF",
          cardTextColor: "#000000",
          cardHighlightColor: "#22C55E",
          includeQrCode: true,
          includePhoto: true,
          includeLogo: true,
          includeValidityDate: true,
          validityPeriodMonths: 12,
          physicalCardPrice: 25.00,
          physicalCardEnabled: true,
          pinEnabled: true,
          pinDigits: 6,
          pinRequireLetters: false,
          pinRequireSpecialChars: false,
          termsText: "Esta carteirinha é pessoal e intransferível. Em caso de perda ou roubo, comunique imediatamente.",
          cardTemplate: "default",
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
    }
    
    res.json(settings);
  } catch (error) {
    console.error("Erro ao obter configurações de carteirinha:", error);
    res.status(500).json({ message: "Erro ao obter configurações de carteirinha" });
  }
});

// Rota para atualizar configurações de carteirinha
socialMembershipCardsRouter.put("/settings/update", authenticate, isAssociation, async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const settingsData = req.body;
    
    // Verificar se já existem configurações
    let settings = await db
      .select()
      .from(socialMembershipCardSettings)
      .where(eq(socialMembershipCardSettings.organizationId, organizationId));
    
    if (settings.length === 0) {
      // Criar configurações
      const [newSettings] = await db
        .insert(socialMembershipCardSettings)
        .values({
          ...settingsData,
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      res.status(201).json({
        message: "Configurações de carteirinha criadas com sucesso!",
        settings: newSettings
      });
    } else {
      // Atualizar configurações
      const [updatedSettings] = await db
        .update(socialMembershipCardSettings)
        .set({
          ...settingsData,
          updatedAt: new Date()
        })
        .where(eq(socialMembershipCardSettings.organizationId, organizationId))
        .returning();
      
      res.json({
        message: "Configurações de carteirinha atualizadas com sucesso!",
        settings: updatedSettings
      });
    }
  } catch (error) {
    console.error("Erro ao atualizar configurações de carteirinha:", error);
    res.status(500).json({ message: "Erro ao atualizar configurações de carteirinha" });
  }
});

// Rota para dados de uma carteirinha para paciente (via QR)
socialMembershipCardsRouter.get("/public/verify/:cardNumber", async (req, res) => {
  try {
    const { cardNumber } = req.params;
    
    // Buscar carteirinha com dados básicos do beneficiário
    const [cardData] = await db
      .select({
        card: {
          id: socialMembershipCards.id,
          cardNumber: socialMembershipCards.cardNumber,
          status: socialMembershipCards.status,
          issueDate: socialMembershipCards.issueDate,
          expiryDate: socialMembershipCards.expiryDate,
          pinEnabled: sql<boolean>`${socialMembershipCards.pin} IS NOT NULL AND ${socialMembershipCards.pinSetupCompleted} = true`
        },
        beneficiary: {
          name: socialBeneficiaries.name,
          membershipType: socialBeneficiaries.membershipType,
          status: socialBeneficiaries.status
        },
        organization: {
          id: sql<number>`o.id`,
          name: sql<string>`o.name`,
          logo: sql<string>`o.logo`
        }
      })
      .from(socialMembershipCards)
      .innerJoin(
        socialBeneficiaries,
        eq(socialMembershipCards.beneficiaryId, socialBeneficiaries.id)
      )
      .innerJoin(
        sql`organizations o`,
        eq(socialMembershipCards.organizationId, sql`o.id`)
      )
      .where(eq(socialMembershipCards.cardNumber, cardNumber));
    
    if (!cardData) {
      return res.status(404).json({ message: "Carteirinha não encontrada" });
    }
    
    // Verificar validade
    const now = new Date();
    const expiryDate = new Date(cardData.card.expiryDate);
    let isValid = true;
    let statusMessage = "Carteirinha válida";
    
    if (cardData.card.status === "expired" || cardData.card.status === "cancelled") {
      isValid = false;
      statusMessage = cardData.card.status === "expired" ? "Carteirinha expirada" : "Carteirinha cancelada";
    } else if (cardData.beneficiary.status !== "active") {
      isValid = false;
      statusMessage = "Associado inativo";
    } else if (now > expiryDate) {
      isValid = false;
      statusMessage = "Carteirinha expirada";
      
      // Atualizar status para expirado
      await db
        .update(socialMembershipCards)
        .set({
          status: "expired",
          updatedAt: new Date()
        })
        .where(eq(socialMembershipCards.cardNumber, cardNumber));
    }
    
    // Registrar acesso
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    await db
      .insert(socialMembershipCardAccessLogs)
      .values({
        cardId: cardData.card.id,
        organizationId: cardData.organization.id,
        accessDate: new Date(),
        accessIp: clientIp,
        accessUserAgent: userAgent,
        accessMethod: "public_verification",
        pinVerified: false,
        createdAt: new Date()
      });
    
    // Retornar informações públicas da carteirinha
    res.json({
      isValid,
      statusMessage,
      cardInfo: {
        cardNumber: cardData.card.cardNumber,
        issueDate: cardData.card.issueDate,
        expiryDate: cardData.card.expiryDate,
        pinProtected: cardData.card.pinEnabled
      },
      beneficiaryInfo: {
        name: cardData.beneficiary.name,
        membershipType: cardData.beneficiary.membershipType
      },
      organizationInfo: {
        name: cardData.organization.name,
        logo: cardData.organization.logo ? `/uploads/logos/${cardData.organization.logo}` : null
      }
    });
  } catch (error) {
    console.error("Erro ao verificar carteirinha:", error);
    res.status(500).json({ message: "Erro ao verificar carteirinha" });
  }
});

// Exportar o router
export { socialMembershipCardsRouter };
export default socialMembershipCardsRouter;