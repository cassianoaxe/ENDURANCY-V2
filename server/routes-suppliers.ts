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

// Estendendo o tipo Request para incluir propriedades personalizadas
declare global {
  namespace Express {
    interface Request {
      supplierId?: number;
    }
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
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    // Verificar se o usuário está associado a algum fornecedor
    const supplierUser = await db.select()
      .from(supplierSchema.supplierUsers)
      .where(eq(supplierSchema.supplierUsers.userId, req.user.id))
      .limit(1);

    if (supplierUser.length === 0) {
      return res.status(403).json({ error: "Acesso negado. Você não está associado a nenhum fornecedor." });
    }

    // Adicionar o ID do fornecedor ao request
    req.supplierId = supplierUser[0].supplierId;
    next();
  } catch (error) {
    console.error("Erro ao verificar fornecedor:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
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
router.get("/orders", authenticate, async (req, res) => {
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
router.get("/orders/:id", authenticate, async (req, res) => {
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

    // Verificar permissão
    if (req.user.role === 'org_admin' && order.organizationId !== req.user.organizationId) {
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
router.put("/orders/:id/status", authenticate, async (req, res) => {
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

    // Verificar permissão
    if (req.user.role === 'org_admin' && order.organizationId !== req.user.organizationId) {
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
      updateData.cancelledBy = req.user.id;
      updateData.cancelReason = req.body.cancelReason || 'Cancelado pelo usuário';
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
router.post("/orders/:id/payment", authenticate, async (req, res) => {
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

    // Verificar permissão
    if (req.user.role === 'org_admin' && order.organizationId !== req.user.organizationId) {
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
router.put("/orders/:id/tracking", authenticate, async (req, res) => {
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

    // Verificar permissão
    const isSupplierAdmin = await db.select()
      .from(supplierSchema.supplierUsers)
      .where(
        and(
          eq(supplierSchema.supplierUsers.userId, req.user.id),
          eq(supplierSchema.supplierUsers.supplierId, order.supplierId),
          eq(supplierSchema.supplierUsers.role, "admin")
        )
      )
      .limit(1);

    if (isSupplierAdmin.length === 0 && req.user.role !== 'admin') {
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