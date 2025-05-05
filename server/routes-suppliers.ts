import express, { Router, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { eq, and, like, ilike, or, desc, asc, sql, gt, lt, isNull, not } from "drizzle-orm";
import * as supplierSchema from "../shared/schema-suppliers";
import { users, organizations } from "../shared/schema";
import { authenticate } from "./routes";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { isEmpty } from "./utils";
import bcrypt from "bcrypt";

// Função auxiliar para obter e validar o ID do fornecedor da sessão
export function getValidSupplierId(req: Request): number | null {
  // Obter o ID do fornecedor da sessão e garantir que é um número válido
  const rawSupplierId = req.session?.supplierId || (req.session?.supplier ? req.session.supplier.id : null);
  const supplierId = parseInt(String(rawSupplierId), 10);
  
  // Verificar se o ID é válido
  if (!supplierId || isNaN(supplierId)) {
    console.log(`ID do fornecedor inválido: ${rawSupplierId}`);
    return null;
  }
  
  return supplierId;
}

// Estendendo o tipo Request para incluir propriedades personalizadas
declare global {
  namespace Express {
    interface Request {
      supplierId?: number;
    }
  }
}

// Definindo tipos para a sessão
declare module "express-session" {
  interface SessionData {
    supplier?: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
    supplierId?: number;
  }
}

// Middleware para verificar se o usuário é administrador do sistema
const isAdmin = (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Acesso negado. Você não é administrador do sistema." });
    }

    next();
  } catch (error) {
    console.error("Erro ao verificar administrador:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

const router = Router();

// Configuração para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/suppliers');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Tipo de arquivo não suportado"));
  }
});

// Middleware para verificar se o usuário é fornecedor
const isSupplier = async (req, res, next) => {
  try {
    console.log("Verificando se o usuário é fornecedor...");
    
    // Verificar se há usuário na sessão
    if (!req.session || !req.session.user) {
      console.log("Sessão ou usuário não encontrado:", { session: !!req.session, user: !!req.session?.user });
      return res.status(401).json({ error: "Não autenticado", details: "Sessão ou usuário não encontrado" });
    }
    
    // Obter ID do usuário da sessão
    const userId = req.session.user.id;
    console.log("ID do usuário da sessão:", userId);
    
    if (!userId) {
      console.log("ID do usuário não encontrado na sessão");
      return res.status(401).json({ error: "Não autenticado", details: "ID do usuário não encontrado na sessão" });
    }

    // Verificar se o usuário está associado a algum fornecedor
    console.log("Buscando associação do usuário com fornecedor...");
    const supplierUser = await db.select()
      .from(supplierSchema.supplierUsers)
      .where(eq(supplierSchema.supplierUsers.userId, userId))
      .limit(1);
    
    console.log("Resultado da busca de associação:", supplierUser);

    if (supplierUser.length === 0) {
      console.log("Usuário não está associado a nenhum fornecedor");
      return res.status(403).json({ 
        error: "Acesso negado. Você não está associado a nenhum fornecedor.",
        details: "Não foi encontrada nenhuma associação entre o usuário e um fornecedor"
      });
    }

    // Adicionar o ID do fornecedor ao request
    req.supplierId = supplierUser[0].supplierId;
    console.log("ID do fornecedor adicionado ao request:", req.supplierId);
    
    // Para compatibilidade, também definimos req.user se não existir
    if (!req.user) {
      req.user = req.session.user;
    }
    
    next();
  } catch (error) {
    console.error("Erro ao verificar fornecedor:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor", 
      details: error instanceof Error ? error.message : "Erro desconhecido" 
    });
  }
};

// Middleware para verificar se o usuário é admin do fornecedor
const isSupplierAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    // Verificar se o usuário é admin de algum fornecedor
    const supplierUser = await db.select()
      .from(supplierSchema.supplierUsers)
      .where(
        and(
          eq(supplierSchema.supplierUsers.userId, req.user.id),
          eq(supplierSchema.supplierUsers.role, "admin")
        )
      )
      .limit(1);

    if (supplierUser.length === 0) {
      return res.status(403).json({ error: "Acesso negado. Você não é administrador de nenhum fornecedor." });
    }

    // Adicionar o ID do fornecedor ao request
    req.supplierId = supplierUser[0].supplierId;
    next();
  } catch (error) {
    console.error("Erro ao verificar admin de fornecedor:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Middleware para verificar se o usuário pode acessar um fornecedor específico
const canAccessSupplier = async (req, res, next) => {
  try {
    const { supplierId } = req.params;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    // Se o usuário for admin do sistema, permitir acesso
    if (req.user.role === "admin") {
      req.supplierId = parseInt(supplierId);
      return next();
    }

    // Verificar se o usuário está associado ao fornecedor
    const supplierUser = await db.select()
      .from(supplierSchema.supplierUsers)
      .where(
        and(
          eq(supplierSchema.supplierUsers.userId, req.user.id),
          eq(supplierSchema.supplierUsers.supplierId, parseInt(supplierId))
        )
      )
      .limit(1);

    if (supplierUser.length === 0) {
      return res.status(403).json({ error: "Acesso negado. Você não tem permissão para acessar este fornecedor." });
    }

    // Adicionar o ID do fornecedor ao request
    req.supplierId = parseInt(supplierId);
    next();
  } catch (error) {
    console.error("Erro ao verificar acesso ao fornecedor:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Rotas de fornecedores

// Listar todos os fornecedores (públicos)
router.get("/", async (req, res) => {
  try {
    const { search, status, verified, page = 1, limit = 20 } = req.query;
    
    let query = db.select({
      id: supplierSchema.suppliers.id,
      name: supplierSchema.suppliers.name,
      tradingName: supplierSchema.suppliers.tradingName,
      city: supplierSchema.suppliers.city,
      state: supplierSchema.suppliers.state,
      logo: supplierSchema.suppliers.logo,
      status: supplierSchema.suppliers.status,
      verified: supplierSchema.suppliers.verified,
      rating: supplierSchema.suppliers.rating,
      ratingCount: supplierSchema.suppliers.ratingCount,
      createdAt: supplierSchema.suppliers.createdAt
    })
    .from(supplierSchema.suppliers)
    .where(
      and(
        // Filtrar apenas fornecedores ativos por padrão
        eq(supplierSchema.suppliers.status, "active")
      )
    )
    .orderBy(desc(supplierSchema.suppliers.createdAt))
    .limit(Number(limit))
    .offset((Number(page) - 1) * Number(limit));

    // Aplicar filtros adicionais se fornecidos
    if (search) {
      const searchTerm = `%${search}%`;
      query = query.where(
        or(
          like(supplierSchema.suppliers.name, searchTerm),
          like(supplierSchema.suppliers.tradingName, searchTerm),
          like(supplierSchema.suppliers.cnpj, searchTerm)
        )
      );
    }

    if (status) {
      query = query.where(eq(supplierSchema.suppliers.status, status.toString()));
    }

    if (verified !== undefined) {
      query = query.where(eq(supplierSchema.suppliers.verified, verified === "true"));
    }

    // Contar total para paginação
    const countQuery = db.select({ count: sql<number>`count(*)` })
      .from(supplierSchema.suppliers);
    
    // Aplicar os mesmos filtros à query de contagem
    if (search) {
      const searchTerm = `%${search}%`;
      countQuery.where(
        or(
          like(supplierSchema.suppliers.name, searchTerm),
          like(supplierSchema.suppliers.tradingName, searchTerm),
          like(supplierSchema.suppliers.cnpj, searchTerm)
        )
      );
    }

    if (status) {
      countQuery.where(eq(supplierSchema.suppliers.status, status.toString()));
    }

    if (verified !== undefined) {
      countQuery.where(eq(supplierSchema.suppliers.verified, verified === "true"));
    }

    const [suppliers, totalResults] = await Promise.all([
      query,
      countQuery
    ]);

    res.json({
      success: true,
      data: suppliers,
      pagination: {
        total: totalResults[0]?.count || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((totalResults[0]?.count || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error("Erro ao listar fornecedores:", error);
    res.status(500).json({ error: "Erro ao carregar fornecedores" });
  }
});

// Obter detalhes de um fornecedor específico (públicos)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const [supplier] = await db.select({
      id: supplierSchema.suppliers.id,
      name: supplierSchema.suppliers.name,
      tradingName: supplierSchema.suppliers.tradingName,
      email: supplierSchema.suppliers.email,
      phone: supplierSchema.suppliers.phone,
      address: supplierSchema.suppliers.address,
      city: supplierSchema.suppliers.city,
      state: supplierSchema.suppliers.state,
      zipCode: supplierSchema.suppliers.zipCode,
      logo: supplierSchema.suppliers.logo,
      status: supplierSchema.suppliers.status,
      verified: supplierSchema.suppliers.verified,
      description: supplierSchema.suppliers.description,
      socialMedia: supplierSchema.suppliers.socialMedia,
      rating: supplierSchema.suppliers.rating,
      ratingCount: supplierSchema.suppliers.ratingCount,
      website: supplierSchema.suppliers.website,
      createdAt: supplierSchema.suppliers.createdAt
    })
    .from(supplierSchema.suppliers)
    .where(eq(supplierSchema.suppliers.id, parseInt(id)))
    .limit(1);

    if (!supplier) {
      return res.status(404).json({ error: "Fornecedor não encontrado" });
    }

    // Buscar categorias do fornecedor
    const categories = await db.select()
      .from(supplierSchema.supplierCategories)
      .where(eq(supplierSchema.supplierCategories.supplierId, parseInt(id)));

    res.json({
      success: true,
      data: {
        ...supplier,
        categories
      }
    });
  } catch (error) {
    console.error("Erro ao buscar fornecedor:", error);
    res.status(500).json({ error: "Erro ao carregar fornecedor" });
  }
});

// Criar novo fornecedor (autenticado)
router.post("/", authenticate, upload.single("logo"), async (req, res) => {
  try {
    const data = req.body;
    
    // Validar dados usando o schema Zod
    const validationSchema = supplierSchema.insertSupplierSchema.omit({ id: true });
    const validatedData = validationSchema.parse(data);
    
    // Adicionar logo se enviado
    let logoPath = null;
    if (req.file) {
      logoPath = `/uploads/suppliers/${req.file.filename}`;
    }

    // Verificar se CNPJ já existe
    const existingSupplier = await db.select({ id: supplierSchema.suppliers.id })
      .from(supplierSchema.suppliers)
      .where(eq(supplierSchema.suppliers.cnpj, validatedData.cnpj))
      .limit(1);

    if (existingSupplier.length > 0) {
      return res.status(400).json({ error: "CNPJ já cadastrado" });
    }

    // Criar fornecedor
    const [newSupplier] = await db.insert(supplierSchema.suppliers)
      .values({
        ...validatedData,
        logo: logoPath,
        status: "pending", // Sempre começa como pendente
        verified: false,
        createdBy: req.user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Adicionar usuário criador como admin do fornecedor
    await db.insert(supplierSchema.supplierUsers)
      .values({
        supplierId: newSupplier.id,
        userId: req.user.id,
        role: "admin",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

    res.status(201).json({
      success: true,
      data: newSupplier,
      message: "Fornecedor criado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao criar fornecedor:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    res.status(500).json({ error: "Erro ao criar fornecedor" });
  }
});

// Atualizar fornecedor (admin do fornecedor)
router.put("/:id", authenticate, canAccessSupplier, upload.single("logo"), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    // Verificar se o fornecedor existe
    const [existingSupplier] = await db.select()
      .from(supplierSchema.suppliers)
      .where(eq(supplierSchema.suppliers.id, parseInt(id)))
      .limit(1);

    if (!existingSupplier) {
      return res.status(404).json({ error: "Fornecedor não encontrado" });
    }

    // Validar dados
    const validationSchema = supplierSchema.insertSupplierSchema.partial().omit({ id: true });
    const validatedData = validationSchema.parse(data);
    
    // Adicionar logo se enviado
    let logoPath = existingSupplier.logo;
    if (req.file) {
      logoPath = `/uploads/suppliers/${req.file.filename}`;
      
      // Remover logo antiga se existir
      if (existingSupplier.logo && existingSupplier.logo.startsWith('/uploads/')) {
        const oldLogoPath = path.join(__dirname, '..', existingSupplier.logo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
    }

    // Atualizar fornecedor
    const [updatedSupplier] = await db.update(supplierSchema.suppliers)
      .set({
        ...validatedData,
        logo: logoPath,
        updatedAt: new Date()
      })
      .where(eq(supplierSchema.suppliers.id, parseInt(id)))
      .returning();

    res.json({
      success: true,
      data: updatedSupplier,
      message: "Fornecedor atualizado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao atualizar fornecedor:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    res.status(500).json({ error: "Erro ao atualizar fornecedor" });
  }
});

// Alterar status do fornecedor (apenas admin)
router.put("/:id/status", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validar status
    if (!["pending", "active", "suspended", "inactive"].includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    // Atualizar status
    const [updatedSupplier] = await db.update(supplierSchema.suppliers)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(supplierSchema.suppliers.id, parseInt(id)))
      .returning();

    if (!updatedSupplier) {
      return res.status(404).json({ error: "Fornecedor não encontrado" });
    }

    res.json({
      success: true,
      data: updatedSupplier,
      message: `Status do fornecedor alterado para ${status}`
    });
  } catch (error) {
    console.error("Erro ao alterar status do fornecedor:", error);
    res.status(500).json({ error: "Erro ao alterar status do fornecedor" });
  }
});

// Verificar fornecedor (apenas admin)
router.put("/:id/verify", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Atualizar verificação
    const [updatedSupplier] = await db.update(supplierSchema.suppliers)
      .set({
        verified: true,
        updatedAt: new Date()
      })
      .where(eq(supplierSchema.suppliers.id, parseInt(id)))
      .returning();

    if (!updatedSupplier) {
      return res.status(404).json({ error: "Fornecedor não encontrado" });
    }

    res.json({
      success: true,
      data: updatedSupplier,
      message: "Fornecedor verificado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao verificar fornecedor:", error);
    res.status(500).json({ error: "Erro ao verificar fornecedor" });
  }
});

// Rota de registro de fornecedor (público)
router.post("/register", upload.single("logo"), async (req, res) => {
  try {
    const data = req.body;
    
    // Validar dados usando o schema Zod
    const validationSchema = z.object({
      companyName: z.string().min(3, "O nome da empresa deve ter pelo menos 3 caracteres"),
      tradingName: z.string().min(2, "O nome fantasia deve ter pelo menos 2 caracteres"),
      cnpj: z.string().min(14, "CNPJ inválido"),
      email: z.string().email("Digite um e-mail válido"),
      phone: z.string().min(10, "Telefone inválido"),
      contactName: z.string().min(3, "O nome do contato deve ter pelo menos 3 caracteres"),
      address: z.string().min(3, "Endereço inválido"),
      city: z.string().min(2, "Cidade inválida"),
      state: z.string().min(2, "Estado inválido"),
      zipCode: z.string().min(8, "CEP inválido"),
      category: z.string().min(1, "Selecione uma categoria"),
      description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
      website: z.string().url("URL inválida").optional(),
      password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    });
    
    const validatedData = validationSchema.parse(data);
    
    // Adicionar logo se enviado
    let logoPath = null;
    if (req.file) {
      logoPath = `/uploads/suppliers/${req.file.filename}`;
    }

    // Verificar se CNPJ já existe
    const existingSupplier = await db.select({ id: supplierSchema.suppliers.id })
      .from(supplierSchema.suppliers)
      .where(eq(supplierSchema.suppliers.cnpj, validatedData.cnpj))
      .limit(1);

    if (existingSupplier.length > 0) {
      return res.status(400).json({ error: "CNPJ já cadastrado" });
    }

    // Verificar se email já existe
    const existingEmail = await db.select({ id: supplierSchema.suppliers.id })
      .from(supplierSchema.suppliers)
      .where(eq(supplierSchema.suppliers.email, validatedData.email))
      .limit(1);

    if (existingEmail.length > 0) {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Criar fornecedor
    const [newSupplier] = await db.insert(supplierSchema.suppliers)
      .values({
        name: validatedData.companyName,
        tradingName: validatedData.tradingName,
        cnpj: validatedData.cnpj,
        email: validatedData.email,
        phone: validatedData.phone,
        contactName: validatedData.contactName,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        logo: logoPath,
        status: "pending", // Sempre começa como pendente
        verified: false,
        description: validatedData.description,
        website: validatedData.website || null,
        passwordHash: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    res.status(201).json({
      success: true,
      data: {
        id: newSupplier.id,
        name: newSupplier.name,
        email: newSupplier.email,
        status: newSupplier.status
      },
      message: "Fornecedor registrado com sucesso. Aguarde aprovação."
    });
  } catch (error) {
    console.error("Erro ao registrar fornecedor:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    res.status(500).json({ error: "Erro ao registrar fornecedor" });
  }
});

// Rota de login do fornecedor
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
    }
    
    // Buscar fornecedor pelo e-mail
    const [supplier] = await db.select()
      .from(supplierSchema.suppliers)
      .where(eq(supplierSchema.suppliers.email, email))
      .limit(1);
    
    if (!supplier) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
    
    // Verificar status
    if (supplier.status === "suspended") {
      return res.status(403).json({ error: "Conta suspensa. Entre em contato com o suporte." });
    }
    
    if (supplier.status === "inactive") {
      return res.status(403).json({ error: "Conta inativa. Entre em contato com o suporte." });
    }
    
    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, supplier.passwordHash);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
    
    // Garantir que o ID seja um número
    const supplierId = Number(supplier.id);
    
    if (isNaN(supplierId)) {
      console.error("ID do fornecedor não é um número válido:", supplier.id);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
    
    // Para garantir que o ID seja armazenado como número, vamos forçar sua conversão
    const supplierIdAsNumber = parseInt(supplierId.toString(), 10);
    
    console.log("ID do fornecedor antes de armazenar na sessão:", {
      original: supplier.id,
      converted: supplierId,
      forceInt: supplierIdAsNumber,
      types: {
        original: typeof supplier.id,
        converted: typeof supplierId,
        forceInt: typeof supplierIdAsNumber
      }
    });
    
    // Criar sessão para o fornecedor - garantindo que o ID seja um número
    req.session.supplier = {
      id: supplierIdAsNumber,
      name: supplier.name,
      email: supplier.email,
      role: "supplier" // Papel específico para fornecedores
    };
    
    // Verificar se o objeto foi criado corretamente
    console.log("Objeto supplier criado na sessão:", req.session.supplier);
    console.log("Tipo do ID no objeto:", typeof req.session.supplier.id);
    
    // Armazenar o ID do fornecedor diretamente na sessão para facilitar o acesso
    req.session.supplierId = supplierIdAsNumber;
    
    // Forçar a persistência da sessão no final do ciclo de requisição
    req.session.save(err => {
      if (err) {
        console.error("Erro ao salvar sessão:", err);
      } else {
        console.log("Sessão salva com sucesso.");
      }
    });
    
    // Debug detalhado da sessão
    console.log("Detalhes da sessão após login:");
    console.log("- req.session.supplier:", req.session.supplier);
    console.log("- req.session.supplierId (valor):", req.session.supplierId);
    console.log("- req.session.supplierId (tipo):", typeof req.session.supplierId);
    console.log("- req.session completo:", JSON.stringify(req.session, null, 2));
    
    // Também atualizar req.session.user para manter compatibilidade com o sistema de autenticação principal
    req.session.user = {
      id: supplierIdAsNumber,
      username: supplier.email,
      name: supplier.name,
      email: supplier.email,
      role: "supplier", // Importante: definir o papel como 'supplier'
      organizationId: null,
      createdAt: supplier.createdAt
    };
    
    console.log("Sessão do fornecedor criada:", req.session.supplier);
    console.log("Sessão de usuário também criada para compatibilidade:", req.session.user);
    console.log("ID do fornecedor armazenado na sessão:", req.session.supplierId, typeof req.session.supplierId);
    
    // Responder com dados do fornecedor
    res.json({
      success: true,
      data: {
        id: supplier.id,
        name: supplier.name,
        tradingName: supplier.tradingName,
        email: supplier.email,
        status: supplier.status,
        verified: supplier.verified,
        logo: supplier.logo
      }
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ error: "Erro ao fazer login" });
  }
});

// Rota para logout de fornecedor
router.post("/logout", (req, res) => {
  // Verificar se existe uma sessão de fornecedor ou usuário
  if (req.session.supplier || req.session.user) {
    // Logar informações para debug
    console.log("Realizando logout de fornecedor:", {
      hasSupplierSession: !!req.session.supplier,
      hasUserSession: !!req.session.user,
      supplierId: req.session.supplierId
    });
    
    // Destruir toda a sessão
    req.session.destroy(err => {
      if (err) {
        console.error("Erro ao destruir sessão durante logout:", err);
        return res.status(500).json({ error: "Erro ao fazer logout", details: err.message });
      }
      
      // Limpar cookie de sessão
      res.clearCookie("connect.sid");
      res.json({ success: true, message: "Logout realizado com sucesso" });
    });
  } else {
    console.log("Tentativa de logout sem sessão ativa");
    res.status(401).json({ error: "Nenhuma sessão ativa" });
  }
});

// Rota para teste básico sem banco de dados - apenas retorna um objeto fixo
router.get("/test-simple", (req, res) => {
  res.json({
    success: true,
    message: "Teste básico ok",
    timestamp: new Date().toISOString(),
    data: {
      id: 2,
      name: "Fornecedor Teste 2",
      tradingName: "Teste2 LTDA",
      email: "teste2@fornecedor.com",
      status: "pending"
    }
  });
});

// Rota para teste de autenticação com função de validação do ID
router.get("/test-auth", async (req, res) => {
  try {
    console.log("================ INÍCIO DEBUG DA ROTA /test-auth ==================");
    console.log("Acessando rota /test-auth para fornecedor");
    
    // Log da sessão para debug
    console.log("SESSÃO:", req.session);
    console.log("Cookie recebido:", req.headers.cookie);
    
    // Verificar autenticação básica
    if (!req.session || (!req.session.supplier && !req.session.user)) {
      console.log("Fornecedor não autenticado - nenhuma sessão encontrada");
      return res.status(401).json({
        success: false,
        error: "Não autenticado",
        message: "Faça login para continuar"
      });
    }
    
    // Obter ID do fornecedor da sessão usando a função auxiliar
    const supplierId = getValidSupplierId(req);
    
    if (!supplierId) {
      console.log("ID do fornecedor inválido ou não encontrado na sessão");
      return res.status(401).json({
        success: false,
        error: "Não autenticado",
        message: "ID do fornecedor inválido na sessão"
      });
    }
    
    // Usar SQL direto para evitar problemas de conversão
    const { pool } = await import('./db');
    console.log(`Executando consulta SQL com ID ${supplierId} obtido da sessão`);
    const result = await pool.query('SELECT id, name, email, status FROM suppliers WHERE id = $1', [supplierId]);
    
    console.log("Resultado da consulta:", result.rows);
    
    if (!result.rows || result.rows.length === 0) {
      console.log("Nenhum fornecedor encontrado");
      return res.status(404).json({
        success: false,
        error: "Fornecedor não encontrado",
        message: `Não existe fornecedor com ID ${supplierId}`
      });
    }
    
    const supplier = result.rows[0];
    
    // Responder com sucesso
    res.json({
      success: true,
      message: "Autenticação de fornecedor verificada com sucesso",
      sessionData: {
        supplier: req.session.supplier,
        supplierId: req.session.supplierId,
        sessionID: req.sessionID
      },
      supplierData: supplier
    });
  } catch (error) {
    console.error("Erro ao testar autenticação:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao testar autenticação",
      message: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
});

// Rota para diagnóstico da conexão com o banco de dados
router.get("/db-test", async (req, res) => {
  try {
    console.log("Testando conexão com o banco de dados...");
    
    // Importar pool diretamente
    const { pool } = await import('./db');
    
    // Teste simples 
    const result = await pool.query('SELECT 1 as test');
    console.log("Resultado do teste de conexão:", result.rows);
    
    // Teste de busca de fornecedor pelo ID 2
    try {
      console.log("Tentando buscar fornecedor com ID 2...");
      const supplierResult = await pool.query('SELECT * FROM suppliers WHERE id = 2');
      console.log("Resultado da busca de fornecedor:", supplierResult.rows);
      
      return res.json({
        success: true,
        message: "Conexão com o banco de dados está funcionando",
        connectionTest: result.rows,
        supplierTest: supplierResult.rows
      });
    } catch (supplierError) {
      console.error("Erro ao buscar fornecedor:", supplierError);
      return res.json({
        success: false,
        message: "Teste de conexão básico bem-sucedido, mas falhou ao buscar fornecedor",
        connectionTest: result.rows,
        error: supplierError.message
      });
    }
  } catch (error) {
    console.error("Erro ao testar conexão com o banco de dados:", error);
    return res.status(500).json({
      success: false,
      message: "Falha na conexão com o banco de dados",
      error: error.message
    });
  }
});

// Rota para obter dados do fornecedor logado - VERSÃO ULTRA SIMPLIFICADA
router.get("/me", async (req, res) => {
  try {
    console.log("================ INÍCIO DEBUG DA ROTA /ME ==================");
    console.log("Acessando rota /me para fornecedor");
    
    // Log da sessão para debug
    console.log("SESSÃO:", req.session);
    console.log("Cookie recebido:", req.headers.cookie);
    
    // Verificar autenticação básica
    if (!req.session || (!req.session.supplier && !req.session.user)) {
      console.log("Fornecedor não autenticado - nenhuma sessão encontrada");
      return res.status(401).json({
        success: false,
        error: "Não autenticado",
        message: "Faça login para continuar"
      });
    }
    
    // Importar pool diretamente do módulo de banco de dados
    const { pool } = await import('./db');
    
    try {
      // Obter ID do fornecedor da sessão usando a função auxiliar
      const supplierId = getValidSupplierId(req);
      
      if (!supplierId) {
        console.log("ID do fornecedor inválido ou não encontrado na sessão");
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
          message: "ID do fornecedor inválido na sessão"
        });
      }
      
      console.log(`Executando consulta SQL com ID ${supplierId} obtido da sessão`);
      const result = await pool.query('SELECT id, name, trading_name as "tradingName", email, phone, contact_name as "contactName", logo, status, verified, description FROM suppliers WHERE id = $1', [supplierId]);
      
      console.log("Resultado da consulta:", result.rows);
      
      if (!result.rows || result.rows.length === 0) {
        console.log("Nenhum fornecedor encontrado");
        return res.status(404).json({
          success: false,
          error: "Fornecedor não encontrado"
        });
      }
      
      const supplier = result.rows[0];
      console.log("Fornecedor encontrado:", supplier);
      
      return res.json({
        success: true,
        data: supplier
      });
    } catch (dbError) {
      console.error("ERRO ESPECÍFICO NA CONSULTA SQL:", dbError);
      return res.status(500).json({
        success: false,
        error: "Erro ao executar consulta SQL",
        details: dbError.message
      });
    }
  } catch (error) {
    console.error("ERRO GERAL:", error);
    return res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
      details: error.message
    });
  }
});

// -----------------------------------------
// ROTAS DE PRODUTOS DOS FORNECEDORES
// -----------------------------------------

// Listar produtos do fornecedor atual
router.get("/my-products", async (req, res) => {
  // Verificar se o fornecedor está autenticado
  if (!req.session || !req.session.supplier || !req.session.supplierId) {
    console.log("Fornecedor não autenticado para listar produtos");
    return res.status(401).json({ 
      success: false,
      error: "Não autenticado como fornecedor", 
      message: "Por favor, faça login novamente"
    });
  }
  
  // Obter ID do fornecedor usando a função auxiliar
  const supplierId = getValidSupplierId(req);
  
  if (!supplierId) {
    console.log("ID do fornecedor inválido ou não encontrado na sessão");
    return res.status(401).json({
      success: false,
      error: "Não autenticado",
      message: "ID do fornecedor inválido na sessão"
    });
  }
  try {
    const { search, status, category, page = 1, limit = 20, sort = "newest" } = req.query;
    
    let query = db.select({
      id: supplierSchema.products.id,
      supplierId: supplierSchema.products.supplierId,
      name: supplierSchema.products.name,
      sku: supplierSchema.products.sku,
      shortDescription: supplierSchema.products.shortDescription,
      price: supplierSchema.products.price,
      compareAtPrice: supplierSchema.products.compareAtPrice,
      status: supplierSchema.products.status,
      isFeatured: supplierSchema.products.isFeatured,
      inventory: supplierSchema.products.inventory,
      tags: supplierSchema.products.tags,
      createdAt: supplierSchema.products.createdAt,
      featuredImage: supplierSchema.products.featuredImage
    })
    .from(supplierSchema.products)
    .where(eq(supplierSchema.products.supplierId, supplierId))
    .limit(Number(limit))
    .offset((Number(page) - 1) * Number(limit));

    // Aplicar filtros adicionais se fornecidos
    if (search) {
      const searchTerm = `%${search}%`;
      query = query.where(
        or(
          like(supplierSchema.products.name, searchTerm),
          like(supplierSchema.products.sku, searchTerm),
          like(supplierSchema.products.shortDescription, searchTerm)
        )
      );
    }

    if (status) {
      query = query.where(eq(supplierSchema.products.status, status.toString()));
    }

    if (category) {
      // Buscar produtos com a categoria especificada
      const categoryId = Number(category);
      
      query = query.where(
        sql`${supplierSchema.products.id} IN (
          SELECT product_id FROM ${supplierSchema.productCategories}
          WHERE category_id = ${categoryId}
        )`
      );
    }

    // Ordenar os resultados
    if (sort === "newest") {
      query = query.orderBy(desc(supplierSchema.products.createdAt));
    } else if (sort === "oldest") {
      query = query.orderBy(asc(supplierSchema.products.createdAt));
    } else if (sort === "price_asc") {
      query = query.orderBy(asc(supplierSchema.products.price));
    } else if (sort === "price_desc") {
      query = query.orderBy(desc(supplierSchema.products.price));
    } else if (sort === "name_asc") {
      query = query.orderBy(asc(supplierSchema.products.name));
    } else if (sort === "name_desc") {
      query = query.orderBy(desc(supplierSchema.products.name));
    }

    // Contar total para paginação
    const countQuery = db.select({ count: sql<number>`count(*)` })
      .from(supplierSchema.products)
      .where(eq(supplierSchema.products.supplierId, supplierId));
    
    // Aplicar os mesmos filtros à query de contagem
    if (search) {
      const searchTerm = `%${search}%`;
      countQuery.where(
        or(
          like(supplierSchema.products.name, searchTerm),
          like(supplierSchema.products.sku, searchTerm),
          like(supplierSchema.products.shortDescription, searchTerm)
        )
      );
    }

    if (status) {
      countQuery.where(eq(supplierSchema.products.status, status.toString()));
    }

    if (category) {
      const categoryId = Number(category);
      
      countQuery.where(
        sql`${supplierSchema.products.id} IN (
          SELECT product_id FROM ${supplierSchema.productCategories}
          WHERE category_id = ${categoryId}
        )`
      );
    }

    const [products, totalResults] = await Promise.all([
      query,
      countQuery
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total: totalResults[0]?.count || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((totalResults[0]?.count || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    res.status(500).json({ error: "Erro ao carregar produtos" });
  }
});

// Obter detalhes de um produto específico do fornecedor
router.get("/products/:id", async (req, res) => {
  // Verificar se o fornecedor está autenticado
  if (!req.session || !req.session.supplier || !req.session.supplierId) {
    console.log("Fornecedor não autenticado para acessar produto");
    return res.status(401).json({ 
      success: false,
      error: "Não autenticado como fornecedor", 
      message: "Por favor, faça login novamente"
    });
  }
  
  // Obter ID do fornecedor usando a função auxiliar
  const supplierId = getValidSupplierId(req);
  
  if (!supplierId) {
    console.log("ID do fornecedor inválido ou não encontrado na sessão");
    return res.status(401).json({
      success: false,
      error: "Não autenticado",
      message: "ID do fornecedor inválido na sessão"
    });
  }
  try {
    const { id } = req.params;
    
    const [product] = await db.select()
      .from(supplierSchema.products)
      .where(
        and(
          eq(supplierSchema.products.id, parseInt(id)),
          eq(supplierSchema.products.supplierId, supplierId)
        )
      )
      .limit(1);

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    // Buscar categorias do produto
    const categories = await db.select({
      id: supplierSchema.productCategories.categoryId,
      name: supplierSchema.supplierCategories.name
    })
    .from(supplierSchema.productCategories)
    .innerJoin(
      supplierSchema.supplierCategories,
      eq(supplierSchema.productCategories.categoryId, supplierSchema.supplierCategories.id)
    )
    .where(eq(supplierSchema.productCategories.productId, parseInt(id)));

    // Buscar imagens do produto
    const images = await db.select()
      .from(supplierSchema.productImages)
      .where(eq(supplierSchema.productImages.productId, parseInt(id)))
      .orderBy(asc(supplierSchema.productImages.position));

    res.json({
      success: true,
      data: {
        ...product,
        categories,
        images
      }
    });
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    res.status(500).json({ error: "Erro ao carregar produto" });
  }
});

// Criar novo produto
router.post("/products", upload.single("featuredImage"), async (req, res) => {
  // Verificar se o fornecedor está autenticado
  if (!req.session || !req.session.supplier || !req.session.supplierId) {
    console.log("Fornecedor não autenticado para criar produto");
    return res.status(401).json({ 
      success: false,
      error: "Não autenticado como fornecedor", 
      message: "Por favor, faça login novamente"
    });
  }
  
  // Obter ID do fornecedor usando a função auxiliar
  const supplierId = getValidSupplierId(req);
  
  if (!supplierId) {
    console.log("ID do fornecedor inválido ou não encontrado na sessão");
    return res.status(401).json({
      success: false,
      error: "Não autenticado",
      message: "ID do fornecedor inválido na sessão"
    });
  }
  try {
    const data = req.body;
    
    // Validar dados usando o schema Zod
    const validationSchema = supplierSchema.insertProductSchema.omit({ id: true });
    const validatedData = validationSchema.parse(data);
    
    // Adicionar imagem destaque se enviada
    let featuredImagePath = null;
    if (req.file) {
      featuredImagePath = `/uploads/suppliers/products/${req.file.filename}`;
    }

    // Verificar se SKU já existe para este fornecedor
    const existingProduct = await db.select({ id: supplierSchema.products.id })
      .from(supplierSchema.products)
      .where(
        and(
          eq(supplierSchema.products.sku, validatedData.sku),
          eq(supplierSchema.products.supplierId, supplierId)
        )
      )
      .limit(1);

    if (existingProduct.length > 0) {
      return res.status(400).json({ error: "SKU já cadastrado para este fornecedor" });
    }

    // Processar categorias se enviadas
    let categories = [];
    if (data.categories) {
      try {
        categories = JSON.parse(data.categories);
      } catch (e) {
        // Se não for um JSON válido, tentar tratar como array de strings
        categories = data.categories.split(',').map(cat => cat.trim());
      }
    }

    // Processar tags se enviadas
    let tags = [];
    if (data.tags) {
      try {
        tags = JSON.parse(data.tags);
      } catch (e) {
        // Se não for um JSON válido, tentar tratar como array de strings
        tags = data.tags.split(',').map(tag => tag.trim());
      }
    }

    // Criar produto
    const [newProduct] = await db.insert(supplierSchema.products)
      .values({
        ...validatedData,
        supplierId: supplierId,
        featuredImage: featuredImagePath,
        status: validatedData.status || "draft",
        tags: tags,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Adicionar categorias ao produto se enviadas
    if (categories.length > 0) {
      const categoryInserts = categories.map(categoryId => ({
        productId: newProduct.id,
        categoryId: parseInt(categoryId),
        createdAt: new Date()
      }));
      
      await db.insert(supplierSchema.productCategories)
        .values(categoryInserts);
    }

    res.status(201).json({
      success: true,
      data: newProduct,
      message: "Produto criado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    res.status(500).json({ error: "Erro ao criar produto" });
  }
});

// Atualizar produto
router.put("/products/:id", upload.single("featuredImage"), async (req, res) => {
  // Verificar se o fornecedor está autenticado
  if (!req.session || !req.session.supplier || !req.session.supplierId) {
    console.log("Fornecedor não autenticado para atualizar produto");
    return res.status(401).json({ 
      success: false,
      error: "Não autenticado como fornecedor", 
      message: "Por favor, faça login novamente"
    });
  }
  
  // Obter ID do fornecedor usando a função auxiliar
  const supplierId = getValidSupplierId(req);
  
  if (!supplierId) {
    console.log("ID do fornecedor inválido ou não encontrado na sessão");
    return res.status(401).json({
      success: false,
      error: "Não autenticado",
      message: "ID do fornecedor inválido na sessão"
    });
  }
  try {
    const { id } = req.params;
    const data = req.body;
    
    // Verificar se o produto existe e pertence ao fornecedor
    const [existingProduct] = await db.select()
      .from(supplierSchema.products)
      .where(
        and(
          eq(supplierSchema.products.id, parseInt(id)),
          eq(supplierSchema.products.supplierId, supplierId)
        )
      )
      .limit(1);

    if (!existingProduct) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    // Validar dados
    const validationSchema = supplierSchema.insertProductSchema.partial().omit({ id: true });
    const validatedData = validationSchema.parse(data);
    
    // Adicionar imagem destaque se enviada
    let featuredImagePath = existingProduct.featuredImage;
    if (req.file) {
      featuredImagePath = `/uploads/suppliers/products/${req.file.filename}`;
      
      // Remover imagem antiga se existir
      if (existingProduct.featuredImage && existingProduct.featuredImage.startsWith('/uploads/')) {
        const oldImagePath = path.join(__dirname, '..', existingProduct.featuredImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // Processar categorias se enviadas
    let categories = [];
    if (data.categories) {
      try {
        categories = JSON.parse(data.categories);
      } catch (e) {
        // Se não for um JSON válido, tentar tratar como array de strings
        categories = data.categories.split(',').map(cat => cat.trim());
      }
    }

    // Processar tags se enviadas
    let tags = existingProduct.tags;
    if (data.tags) {
      try {
        tags = JSON.parse(data.tags);
      } catch (e) {
        // Se não for um JSON válido, tentar tratar como array de strings
        tags = data.tags.split(',').map(tag => tag.trim());
      }
    }

    // Atualizar produto
    const [updatedProduct] = await db.update(supplierSchema.products)
      .set({
        ...validatedData,
        featuredImage: featuredImagePath,
        tags: tags,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(supplierSchema.products.id, parseInt(id)),
          eq(supplierSchema.products.supplierId, supplierId)
        )
      )
      .returning();

    // Atualizar categorias se enviadas
    if (categories.length > 0) {
      // Remover categorias antigas
      await db.delete(supplierSchema.productCategories)
        .where(eq(supplierSchema.productCategories.productId, parseInt(id)));
      
      // Adicionar novas categorias
      const categoryInserts = categories.map(categoryId => ({
        productId: parseInt(id),
        categoryId: parseInt(categoryId),
        createdAt: new Date()
      }));
      
      await db.insert(supplierSchema.productCategories)
        .values(categoryInserts);
    }

    res.json({
      success: true,
      data: updatedProduct,
      message: "Produto atualizado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    res.status(500).json({ error: "Erro ao atualizar produto" });
  }
});

// Excluir produto
router.delete("/products/:id", async (req, res) => {
  // Verificar se o fornecedor está autenticado
  if (!req.session || !req.session.supplier || !req.session.supplierId) {
    console.log("Fornecedor não autenticado para excluir produto");
    return res.status(401).json({ 
      success: false,
      error: "Não autenticado como fornecedor", 
      message: "Por favor, faça login novamente"
    });
  }
  
  // Obter ID do fornecedor usando a função auxiliar
  const supplierId = getValidSupplierId(req);
  
  if (!supplierId) {
    console.log("ID do fornecedor inválido ou não encontrado na sessão");
    return res.status(401).json({
      success: false,
      error: "Não autenticado",
      message: "ID do fornecedor inválido na sessão"
    });
  }
  try {
    const { id } = req.params;
    
    // Verificar se o produto existe e pertence ao fornecedor
    const [existingProduct] = await db.select()
      .from(supplierSchema.products)
      .where(
        and(
          eq(supplierSchema.products.id, parseInt(id)),
          eq(supplierSchema.products.supplierId, supplierId)
        )
      )
      .limit(1);

    if (!existingProduct) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    // Remover imagem destaque se existir
    if (existingProduct.featuredImage && existingProduct.featuredImage.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', existingProduct.featuredImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Remover relacionamentos primeiro
    await db.delete(supplierSchema.productCategories)
      .where(eq(supplierSchema.productCategories.productId, parseInt(id)));
    
    // Buscar e remover imagens do produto
    const images = await db.select()
      .from(supplierSchema.productImages)
      .where(eq(supplierSchema.productImages.productId, parseInt(id)));
    
    for (const image of images) {
      if (image.url && image.url.startsWith('/uploads/')) {
        const imagePath = path.join(__dirname, '..', image.url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }
    
    await db.delete(supplierSchema.productImages)
      .where(eq(supplierSchema.productImages.productId, parseInt(id)));
    
    // Finalmente excluir o produto
    await db.delete(supplierSchema.products)
      .where(
        and(
          eq(supplierSchema.products.id, parseInt(id)),
          eq(supplierSchema.products.supplierId, supplierId)
        )
      );

    res.json({
      success: true,
      message: "Produto excluído com sucesso"
    });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    res.status(500).json({ error: "Erro ao excluir produto" });
  }
});

// Rotas para gerenciar usuários do fornecedor

// Listar usuários de um fornecedor
router.get("/:id/users", authenticate, canAccessSupplier, async (req, res) => {
  try {
    const { id } = req.params;
    
    const supplierUsers = await db.select({
      id: supplierSchema.supplierUsers.id,
      supplierId: supplierSchema.supplierUsers.supplierId,
      userId: supplierSchema.supplierUsers.userId,
      role: supplierSchema.supplierUsers.role,
      isActive: supplierSchema.supplierUsers.isActive,
      createdAt: supplierSchema.supplierUsers.createdAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        username: users.username
      }
    })
    .from(supplierSchema.supplierUsers)
    .innerJoin(users, eq(supplierSchema.supplierUsers.userId, users.id))
    .where(eq(supplierSchema.supplierUsers.supplierId, parseInt(id)));

    res.json({
      success: true,
      data: supplierUsers
    });
  } catch (error) {
    console.error("Erro ao listar usuários do fornecedor:", error);
    res.status(500).json({ error: "Erro ao carregar usuários do fornecedor" });
  }
});

// Adicionar usuário ao fornecedor
router.post("/:id/users", authenticate, isSupplierAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;
    
    // Validar role
    if (!["admin", "manager", "member"].includes(role)) {
      return res.status(400).json({ error: "Função inválida" });
    }

    // Verificar se o usuário existe
    const [userExists] = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userExists) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Verificar se o usuário já está associado ao fornecedor
    const [existingLink] = await db.select({ id: supplierSchema.supplierUsers.id })
      .from(supplierSchema.supplierUsers)
      .where(
        and(
          eq(supplierSchema.supplierUsers.supplierId, parseInt(id)),
          eq(supplierSchema.supplierUsers.userId, userId)
        )
      )
      .limit(1);

    if (existingLink) {
      return res.status(400).json({ error: "Usuário já associado a este fornecedor" });
    }

    // Adicionar usuário ao fornecedor
    const [newLink] = await db.insert(supplierSchema.supplierUsers)
      .values({
        supplierId: parseInt(id),
        userId,
        role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newLink,
      message: "Usuário adicionado ao fornecedor com sucesso"
    });
  } catch (error) {
    console.error("Erro ao adicionar usuário ao fornecedor:", error);
    res.status(500).json({ error: "Erro ao adicionar usuário ao fornecedor" });
  }
});

// Atualizar papel do usuário no fornecedor
router.put("/:id/users/:userId", authenticate, isSupplierAdmin, async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role, isActive } = req.body;
    
    // Validar role se fornecido
    if (role && !["admin", "manager", "member"].includes(role)) {
      return res.status(400).json({ error: "Função inválida" });
    }

    // Construir objeto de atualização com campos não vazios
    const updateData: any = { updatedAt: new Date() };
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Atualizar link
    const [updatedLink] = await db.update(supplierSchema.supplierUsers)
      .set(updateData)
      .where(
        and(
          eq(supplierSchema.supplierUsers.supplierId, parseInt(id)),
          eq(supplierSchema.supplierUsers.userId, parseInt(userId))
        )
      )
      .returning();

    if (!updatedLink) {
      return res.status(404).json({ error: "Associação usuário-fornecedor não encontrada" });
    }

    res.json({
      success: true,
      data: updatedLink,
      message: "Associação usuário-fornecedor atualizada com sucesso"
    });
  } catch (error) {
    console.error("Erro ao atualizar associação usuário-fornecedor:", error);
    res.status(500).json({ error: "Erro ao atualizar associação usuário-fornecedor" });
  }
});

// Remover usuário do fornecedor
router.delete("/:id/users/:userId", authenticate, isSupplierAdmin, async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    // Evitar que o último admin seja removido
    if (req.user.id === parseInt(userId)) {
      // Verificar se é o último admin
      const adminCount = await db.select({ count: sql<number>`count(*)` })
        .from(supplierSchema.supplierUsers)
        .where(
          and(
            eq(supplierSchema.supplierUsers.supplierId, parseInt(id)),
            eq(supplierSchema.supplierUsers.role, "admin"),
            eq(supplierSchema.supplierUsers.isActive, true)
          )
        );
      
      if (adminCount[0].count <= 1) {
        return res.status(400).json({ 
          error: "Não é possível remover o último administrador. Defina outro usuário como administrador primeiro." 
        });
      }
    }

    // Remover link
    const result = await db.delete(supplierSchema.supplierUsers)
      .where(
        and(
          eq(supplierSchema.supplierUsers.supplierId, parseInt(id)),
          eq(supplierSchema.supplierUsers.userId, parseInt(userId))
        )
      );

    res.json({
      success: true,
      message: "Usuário removido do fornecedor com sucesso"
    });
  } catch (error) {
    console.error("Erro ao remover usuário do fornecedor:", error);
    res.status(500).json({ error: "Erro ao remover usuário do fornecedor" });
  }
});

// Rotas para gerenciar produtos

// Listar produtos de um fornecedor
router.get("/:id/products", async (req, res) => {
  // Verificar se o fornecedor está autenticado
  if (!req.session || !req.session.supplier || !req.session.supplierId) {
    console.log("Fornecedor não autenticado para listar produtos");
    return res.status(401).json({ 
      success: false,
      error: "Não autenticado como fornecedor", 
      message: "Por favor, faça login novamente"
    });
  }
  
  // Obter ID do fornecedor usando a função auxiliar
  const supplierId = getValidSupplierId(req);
  
  if (!supplierId) {
    console.log("ID do fornecedor inválido ou não encontrado na sessão");
    return res.status(401).json({
      success: false,
      error: "Não autenticado",
      message: "ID do fornecedor inválido na sessão"
    });
  }
  
  // Verificar se o ID do fornecedor na URL corresponde ao ID na sessão
  const requestedId = parseInt(req.params.id);
  
  if (supplierId !== requestedId) {
    return res.status(403).json({ 
      success: false,
      error: "Acesso negado", 
      message: "Você não tem permissão para acessar produtos de outro fornecedor"
    });
  }
  
  try {
    const { id } = req.params;
    const { search, category, status, featured, page = 1, limit = 20 } = req.query;
    
    // Query base para produtos
    let query = db.select({
      id: supplierSchema.products.id,
      supplierId: supplierSchema.products.supplierId,
      name: supplierSchema.products.name,
      sku: supplierSchema.products.sku,
      shortDescription: supplierSchema.products.shortDescription,
      price: supplierSchema.products.price,
      compareAtPrice: supplierSchema.products.compareAtPrice,
      status: supplierSchema.products.status,
      isFeatured: supplierSchema.products.isFeatured,
      inventory: supplierSchema.products.inventory,
      tags: supplierSchema.products.tags,
      createdAt: supplierSchema.products.createdAt
    })
    .from(supplierSchema.products)
    .where(eq(supplierSchema.products.supplierId, parseInt(id)))
    .orderBy(desc(supplierSchema.products.createdAt))
    .limit(Number(limit))
    .offset((Number(page) - 1) * Number(limit));

    // Adicionar filtros adicionais
    if (search) {
      const searchTerm = `%${search}%`;
      query = query.where(
        or(
          like(supplierSchema.products.name, searchTerm),
          like(supplierSchema.products.sku, searchTerm),
          like(supplierSchema.products.shortDescription, searchTerm)
        )
      );
    }

    if (status) {
      query = query.where(eq(supplierSchema.products.status, status.toString()));
    }

    if (featured !== undefined) {
      query = query.where(eq(supplierSchema.products.isFeatured, featured === "true"));
    }

    // Filtro por categoria
    if (category) {
      query = db.select({
        id: supplierSchema.products.id,
        supplierId: supplierSchema.products.supplierId,
        name: supplierSchema.products.name,
        sku: supplierSchema.products.sku,
        shortDescription: supplierSchema.products.shortDescription,
        price: supplierSchema.products.price,
        compareAtPrice: supplierSchema.products.compareAtPrice,
        status: supplierSchema.products.status,
        isFeatured: supplierSchema.products.isFeatured,
        inventory: supplierSchema.products.inventory,
        tags: supplierSchema.products.tags,
        createdAt: supplierSchema.products.createdAt
      })
      .from(supplierSchema.products)
      .innerJoin(
        supplierSchema.productCategoryLinks,
        eq(supplierSchema.products.id, supplierSchema.productCategoryLinks.productId)
      )
      .where(
        and(
          eq(supplierSchema.products.supplierId, parseInt(id)),
          eq(supplierSchema.productCategoryLinks.categoryId, parseInt(category as string))
        )
      )
      .orderBy(desc(supplierSchema.products.createdAt))
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit));
    }

    // Contar total para paginação
    const countQuery = db.select({ count: sql<number>`count(*)` })
      .from(supplierSchema.products)
      .where(eq(supplierSchema.products.supplierId, parseInt(id)));
    
    // Aplicar os mesmos filtros à query de contagem
    if (search) {
      const searchTerm = `%${search}%`;
      countQuery.where(
        or(
          like(supplierSchema.products.name, searchTerm),
          like(supplierSchema.products.sku, searchTerm),
          like(supplierSchema.products.shortDescription, searchTerm)
        )
      );
    }

    if (status) {
      countQuery.where(eq(supplierSchema.products.status, status.toString()));
    }

    if (featured !== undefined) {
      countQuery.where(eq(supplierSchema.products.isFeatured, featured === "true"));
    }

    // Executar queries
    const [products, totalResults] = await Promise.all([
      query,
      countQuery
    ]);

    // Adicionar imagens principais aos produtos
    const productIds = products.map(p => p.id);
    let featuredImages = [];
    
    if (productIds.length > 0) {
      featuredImages = await db.select()
        .from(supplierSchema.productImages)
        .where(
          and(
            sql`${supplierSchema.productImages.productId} IN (${sql.join(productIds)})`,
            eq(supplierSchema.productImages.isFeatured, true)
          )
        );
      
      // Se não houver imagens em destaque, buscar primeiras imagens
      if (featuredImages.length === 0) {
        featuredImages = await db.select()
          .from(supplierSchema.productImages)
          .where(sql`${supplierSchema.productImages.productId} IN (${sql.join(productIds)})`)
          .orderBy(supplierSchema.productImages.position, supplierSchema.productImages.id);
      }
    }
    
    // Mapear imagens aos produtos
    const productsWithImages = products.map(product => {
      const image = featuredImages.find(img => img.productId === product.id);
      return {
        ...product,
        featuredImage: image ? image.url : null
      };
    });

    res.json({
      success: true,
      data: productsWithImages,
      pagination: {
        total: totalResults[0]?.count || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((totalResults[0]?.count || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    res.status(500).json({ error: "Erro ao carregar produtos" });
  }
});

// Rotas para gerenciamento de pedidos (Marketplace)

// Listar todos os pedidos
router.get("/orders", async (req, res) => {
  // Verificar se o fornecedor está autenticado
  if (!req.session || !req.session.supplier || !req.session.supplierId) {
    console.log("Fornecedor não autenticado para listar pedidos");
    return res.status(401).json({ 
      success: false,
      error: "Não autenticado como fornecedor", 
      message: "Por favor, faça login novamente"
    });
  }
  
  // Obter ID do fornecedor usando a função auxiliar
  const supplierId = getValidSupplierId(req);
  
  if (!supplierId) {
    console.log("ID do fornecedor inválido ou não encontrado na sessão");
    return res.status(401).json({
      success: false,
      error: "Não autenticado",
      message: "ID do fornecedor inválido na sessão"
    });
  }
  try {
    const { status, page = 1, limit = 20, supplierId } = req.query;
    
    let query = db.select({
      id: supplierSchema.orders.id,
      orderNumber: supplierSchema.orders.orderNumber,
      supplierId: supplierSchema.orders.supplierId,
      organizationId: supplierSchema.orders.organizationId,
      status: supplierSchema.orders.status,
      totalAmount: supplierSchema.orders.totalAmount,
      createdAt: supplierSchema.orders.createdAt,
      paymentStatus: supplierSchema.orders.paymentStatus,
      confirmedAt: supplierSchema.orders.confirmedAt,
      estimatedDeliveryDate: supplierSchema.orders.estimatedDeliveryDate,
      supplierName: supplierSchema.suppliers.name,
      organizationName: organizations.name
    })
    .from(supplierSchema.orders)
    .leftJoin(supplierSchema.suppliers, eq(supplierSchema.orders.supplierId, supplierSchema.suppliers.id))
    .leftJoin(organizations, eq(supplierSchema.orders.organizationId, organizations.id))
    .orderBy(desc(supplierSchema.orders.createdAt))
    .limit(Number(limit))
    .offset((Number(page) - 1) * Number(limit));

    // Filtrar por status se fornecido (e diferente de "all")
    if (status && status !== 'all') {
      query = query.where(eq(supplierSchema.orders.status, status.toString()));
    }

    // Filtrar por fornecedor se fornecido
    if (supplierId) {
      query = query.where(eq(supplierSchema.orders.supplierId, Number(supplierId)));
    }

    // Filtrar por organização se o usuário for org_admin
    if (req.user.role === 'org_admin') {
      query = query.where(eq(supplierSchema.orders.organizationId, req.user.organizationId));
    }

    // Contar total para paginação
    const countQuery = db.select({ count: sql<number>`count(*)` })
      .from(supplierSchema.orders);
    
    // Aplicar os mesmos filtros à query de contagem
    if (status) {
      countQuery.where(eq(supplierSchema.orders.status, status.toString()));
    }

    if (supplierId) {
      countQuery.where(eq(supplierSchema.orders.supplierId, Number(supplierId)));
    }

    if (req.user.role === 'org_admin') {
      countQuery.where(eq(supplierSchema.orders.organizationId, req.user.organizationId));
    }

    const [orders, totalResults] = await Promise.all([
      query,
      countQuery
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total: totalResults[0]?.count || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((totalResults[0]?.count || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    res.status(500).json({ error: "Erro ao carregar pedidos" });
  }
});

// Obter detalhes de um pedido específico
router.get("/orders/:id", async (req, res) => {
  // Verificar se o fornecedor está autenticado
  if (!req.session || !req.session.supplier || !req.session.supplierId) {
    console.log("Fornecedor não autenticado para ver detalhes do pedido");
    return res.status(401).json({ 
      success: false,
      error: "Não autenticado como fornecedor", 
      message: "Por favor, faça login novamente"
    });
  }
  
  // Obter ID do fornecedor usando a função auxiliar
  const supplierId = getValidSupplierId(req);
  
  if (!supplierId) {
    console.log("ID do fornecedor inválido ou não encontrado na sessão");
    return res.status(401).json({
      success: false,
      error: "Não autenticado",
      message: "ID do fornecedor inválido na sessão"
    });
  }
  try {
    const { id } = req.params;
    
    // Buscar pedido
    const [order] = await db.select()
      .from(supplierSchema.orders)
      .where(eq(supplierSchema.orders.id, parseInt(id)))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // Verificar permissão para fornecedor
    if (order.supplierId !== supplierId) {
      return res.status(403).json({ error: "Você não tem permissão para acessar este pedido" });
    }

    // Buscar itens do pedido
    const orderItems = await db.select({
      id: supplierSchema.orderItems.id,
      productId: supplierSchema.orderItems.productId,
      productName: supplierSchema.products.name,
      quantity: supplierSchema.orderItems.quantity,
      price: supplierSchema.orderItems.price,
      subtotal: supplierSchema.orderItems.subtotal,
      productImage: supplierSchema.productImages.url
    })
    .from(supplierSchema.orderItems)
    .leftJoin(supplierSchema.products, eq(supplierSchema.orderItems.productId, supplierSchema.products.id))
    .leftJoin(
      supplierSchema.productImages,
      and(
        eq(supplierSchema.productImages.productId, supplierSchema.products.id),
        eq(supplierSchema.productImages.isFeatured, true)
      )
    )
    .where(eq(supplierSchema.orderItems.orderId, parseInt(id)));

    // Buscar informações do fornecedor
    const [supplier] = await db.select({
      id: supplierSchema.suppliers.id,
      name: supplierSchema.suppliers.name,
      email: supplierSchema.suppliers.email,
      phone: supplierSchema.suppliers.phone,
      address: supplierSchema.suppliers.address,
      city: supplierSchema.suppliers.city,
      state: supplierSchema.suppliers.state
    })
    .from(supplierSchema.suppliers)
    .where(eq(supplierSchema.suppliers.id, order.supplierId))
    .limit(1);

    // Buscar informações da organização
    const [organization] = await db.select({
      id: organizations.id,
      name: organizations.name,
      email: users.email,
      phone: organizations.phone,
      address: organizations.address
    })
    .from(organizations)
    .leftJoin(users, eq(organizations.adminId, users.id))
    .where(eq(organizations.id, order.organizationId))
    .limit(1);

    res.json({
      success: true,
      data: {
        ...order,
        items: orderItems,
        supplier,
        organization
      }
    });
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    res.status(500).json({ error: "Erro ao carregar pedido" });
  }
});

// Criar novo pedido
router.post("/orders", authenticate, async (req, res) => {
  try {
    const { supplierId, items, shippingAddress, billingAddress } = req.body;

    // Validar se o usuário pode criar pedidos
    if (req.user.role !== 'org_admin') {
      return res.status(403).json({ error: "Apenas administradores de organização podem criar pedidos" });
    }

    // Validar dados
    if (!supplierId || !items || !items.length) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    // Validar se o fornecedor existe
    const [supplier] = await db.select()
      .from(supplierSchema.suppliers)
      .where(eq(supplierSchema.suppliers.id, supplierId))
      .limit(1);

    if (!supplier) {
      return res.status(404).json({ error: "Fornecedor não encontrado" });
    }

    // Buscar produtos para validar preços e disponibilidade
    const productIds = items.map(item => item.productId);
    const products = await db.select()
      .from(supplierSchema.products)
      .where(and(
        sql`${supplierSchema.products.id} IN (${sql.join(productIds)})`,
        eq(supplierSchema.products.supplierId, supplierId),
        eq(supplierSchema.products.status, "active")
      ));

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: "Um ou mais produtos não estão disponíveis" });
    }

    // Calcular valores
    let subtotal = 0;
    const validatedItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      const itemPrice = parseFloat(product.price.toString());
      const itemSubtotal = itemPrice * item.quantity;
      subtotal += itemSubtotal;
      
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: itemPrice,
        subtotal: itemSubtotal
      };
    });

    // Aplicar taxas
    const taxAmount = 0; // Implementar cálculo de impostos se necessário
    const discountAmount = 0; // Implementar descontos se necessário
    const shippingAmount = 0; // Implementar cálculo de frete se necessário
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    // Gerar número de pedido único
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Criar pedido
    const [newOrder] = await db.insert(supplierSchema.orders)
      .values({
        organizationId: req.user.organizationId,
        supplierId,
        orderNumber,
        status: "draft",
        subtotal,
        taxAmount,
        discountAmount,
        shippingAmount,
        totalAmount,
        paymentMethod: "pending",
        paymentStatus: "pending",
        shippingAddress: shippingAddress || null,
        billingAddress: billingAddress || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: req.user.id
      })
      .returning();

    // Criar itens do pedido
    for (const item of validatedItems) {
      await db.insert(supplierSchema.orderItems)
        .values({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
          createdAt: new Date()
        });
    }

    res.status(201).json({
      success: true,
      data: newOrder,
      message: "Pedido criado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    res.status(500).json({ error: "Erro ao criar pedido" });
  }
});

// Atualizar status do pedido
router.put("/orders/:id/status", async (req, res) => {
  // Verificar se o fornecedor está autenticado
  if (!req.session || !req.session.supplier || !req.session.supplierId) {
    console.log("Fornecedor não autenticado para atualizar status do pedido");
    return res.status(401).json({ 
      success: false,
      error: "Não autenticado como fornecedor", 
      message: "Por favor, faça login novamente"
    });
  }
  
  // Obter ID do fornecedor usando a função auxiliar
  const supplierId = getValidSupplierId(req);
  
  if (!supplierId) {
    console.log("ID do fornecedor inválido ou não encontrado na sessão");
    return res.status(401).json({
      success: false,
      error: "Não autenticado",
      message: "ID do fornecedor inválido na sessão"
    });
  }
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validar status
    if (!["draft", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"].includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    // Buscar pedido
    const [order] = await db.select()
      .from(supplierSchema.orders)
      .where(eq(supplierSchema.orders.id, parseInt(id)))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // Verificar permissão para fornecedor
    if (order.supplierId !== supplierId) {
      return res.status(403).json({ error: "Você não tem permissão para atualizar este pedido" });
    }

    // Atualizar campos específicos com base no status
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'confirmed' && order.status !== 'confirmed') {
      updateData.confirmedAt = new Date();
    } else if (status === 'shipped' && order.status !== 'shipped') {
      updateData.shippedAt = new Date();
    } else if (status === 'delivered' && order.status !== 'delivered') {
      updateData.deliveredAt = new Date();
    } else if (status === 'cancelled' && order.status !== 'cancelled') {
      updateData.cancelledAt = new Date();
      updateData.cancelledBy = supplierId;
      updateData.cancelReason = req.body.cancelReason || 'Cancelado pelo fornecedor';
    }

    // Atualizar pedido
    const [updatedOrder] = await db.update(supplierSchema.orders)
      .set(updateData)
      .where(eq(supplierSchema.orders.id, parseInt(id)))
      .returning();

    res.json({
      success: true,
      data: updatedOrder,
      message: `Status do pedido alterado para ${status}`
    });
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    res.status(500).json({ error: "Erro ao atualizar status do pedido" });
  }
});

// Integração de pagamento (Zoop)
router.post("/orders/:id/payment", async (req, res) => {
  // Verificar se o fornecedor está autenticado
  if (!req.session || !req.session.supplier || !req.session.supplierId) {
    console.log("Fornecedor não autenticado para processar pagamento");
    return res.status(401).json({ 
      success: false,
      error: "Não autenticado como fornecedor", 
      message: "Por favor, faça login novamente"
    });
  }
  
  // Obter ID do fornecedor usando a função auxiliar
  const supplierId = getValidSupplierId(req);
  
  if (!supplierId) {
    console.log("ID do fornecedor inválido ou não encontrado na sessão");
    return res.status(401).json({
      success: false,
      error: "Não autenticado",
      message: "ID do fornecedor inválido na sessão"
    });
  }
  try {
    const { id } = req.params;
    const { paymentMethod, paymentData } = req.body;
    
    // Buscar pedido
    const [order] = await db.select()
      .from(supplierSchema.orders)
      .where(eq(supplierSchema.orders.id, parseInt(id)))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // Verificar permissão para fornecedor
    if (order.supplierId !== supplierId) {
      return res.status(403).json({ error: "Você não tem permissão para processar pagamento deste pedido" });
    }

    // Simular processamento de pagamento (no futuro, integrar com Zoop)
    // Em uma implementação real, aqui chamaríamos a API da Zoop para processar o pagamento
    
    const paymentResult = {
      success: true,
      transactionId: `TRANS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      paymentMethod,
      amount: order.totalAmount,
      status: "approved"
    };

    // Atualizar pedido com informações de pagamento
    const [updatedOrder] = await db.update(supplierSchema.orders)
      .set({
        paymentMethod,
        paymentStatus: "paid",
        status: "confirmed",
        confirmedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(supplierSchema.orders.id, parseInt(id)))
      .returning();

    res.json({
      success: true,
      data: {
        order: updatedOrder,
        payment: paymentResult
      },
      message: "Pagamento processado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao processar pagamento:", error);
    res.status(500).json({ error: "Erro ao processar pagamento" });
  }
});

// Adicionar rastreamento
router.put("/orders/:id/tracking", async (req, res) => {
  // Verificar se o fornecedor está autenticado
  if (!req.session || !req.session.supplier || !req.session.supplierId) {
    console.log("Fornecedor não autenticado para adicionar rastreamento");
    return res.status(401).json({ 
      success: false,
      error: "Não autenticado como fornecedor", 
      message: "Por favor, faça login novamente"
    });
  }
  
  // Obter ID do fornecedor usando a função auxiliar
  const supplierId = getValidSupplierId(req);
  
  if (!supplierId) {
    console.log("ID do fornecedor inválido ou não encontrado na sessão");
    return res.status(401).json({
      success: false,
      error: "Não autenticado",
      message: "ID do fornecedor inválido na sessão"
    });
  }
  try {
    const { id } = req.params;
    const { trackingNumber, trackingUrl, estimatedDeliveryDate } = req.body;
    
    // Buscar pedido
    const [order] = await db.select()
      .from(supplierSchema.orders)
      .where(eq(supplierSchema.orders.id, parseInt(id)))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // Verificar permissão para fornecedor
    if (order.supplierId !== supplierId) {
      return res.status(403).json({ error: "Você não tem permissão para adicionar rastreamento a este pedido" });
    }

    // Atualizar pedido com informações de rastreamento
    const [updatedOrder] = await db.update(supplierSchema.orders)
      .set({
        trackingNumber: trackingNumber || null,
        trackingUrl: trackingUrl || null,
        estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : null,
        status: "shipped",
        shippedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(supplierSchema.orders.id, parseInt(id)))
      .returning();

    res.json({
      success: true,
      data: updatedOrder,
      message: "Informações de rastreamento adicionadas com sucesso"
    });
  } catch (error) {
    console.error("Erro ao adicionar rastreamento:", error);
    res.status(500).json({ error: "Erro ao adicionar rastreamento" });
  }
});

export function registerSupplierRoutes(app: express.Express) {
  app.use("/api/suppliers", router);
  console.log("Rotas do módulo de fornecedores registradas com sucesso");
}