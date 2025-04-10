import { Express, Request, Response } from 'express';
import { and, eq, ne } from 'drizzle-orm';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { patients, patientDocuments, users, organizations } from '../../shared/schema';

// Interface para requisição autenticada
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: 'admin' | 'org_admin' | 'doctor' | 'patient' | 'manager' | 'employee' | 'pharmacist';
    name: string;
    email: string;
    organizationId: number | null;
  };
}

// Middleware para verificar se o usuário é um paciente
const isPatientMiddleware = (req: AuthenticatedRequest, res: Response, next: Function) => {
  if (!req.user || req.user.role !== 'patient') {
    return res.status(403).json({ message: 'Acesso negado. Apenas pacientes podem acessar este recurso.' });
  }
  next();
};

// Middleware para verificar se o usuário é um farmacêutico
const isPharmacistMiddleware = (req: AuthenticatedRequest, res: Response, next: Function) => {
  if (!req.user || req.user.role !== 'pharmacist') {
    return res.status(403).json({ message: 'Acesso negado. Apenas farmacêuticos podem acessar este recurso.' });
  }
  
  // Verificar se o farmacêutico está associado a uma organização
  if (!req.user.organizationId) {
    return res.status(403).json({ message: 'Farmacêutico não está associado a nenhuma organização' });
  }
  
  next();
};

// Configuração do armazenamento de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Criar a pasta de uploads se não existir
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gerar um nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${fileExt}`);
  },
});

// Filtro para validar tipos de arquivo
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Aceitar apenas PDFs e imagens
  const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo inválido. Apenas PDF, JPEG e PNG são permitidos.'));
  }
};

// Configuração do upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export async function registerDocumentRoutes(app: Express) {
  // Rota para upload de documento por paciente
  app.post('/api/patient/documents', isPatientMiddleware, upload.single('file'), 
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado' });
      }

      const { category } = req.body;
      
      if (!category) {
        return res.status(400).json({ message: 'Categoria do documento é obrigatória' });
      }

      // Obter o ID do paciente
      const patientData = await db
        .select()
        .from(patients)
        .where(eq(patients.userId, req.user?.id as number));
      
      if (patientData.length === 0) {
        return res.status(404).json({ message: 'Perfil de paciente não encontrado' });
      }
      
      const patientId = patientData[0].id;
      const organizationId = patientData[0].organizationId;

      // Criar o registro do documento
      const newDocument = await db.insert(patientDocuments).values({
        patientId,
        organizationId,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        category,
        status: 'pending',
        uploadDate: new Date()
      }).returning();

      // Criar a URL pública para o documento
      const documentUrl = `/uploads/documents/${req.file.filename}`;

      res.status(201).json({
        message: 'Documento enviado com sucesso',
        document: {
          ...newDocument[0],
          url: documentUrl
        }
      });
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      res.status(500).json({ message: 'Erro ao enviar documento' });
    }
  });

  // Rota para listar documentos do paciente logado
  app.get('/api/patient/documents', isPatientMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Obter o ID do paciente
      const patientData = await db
        .select()
        .from(patients)
        .where(eq(patients.userId, req.user?.id as number));
      
      if (patientData.length === 0) {
        return res.status(404).json({ message: 'Perfil de paciente não encontrado' });
      }
      
      const patientId = patientData[0].id;

      // Buscar documentos do paciente
      const documents = await db
        .select({
          id: patientDocuments.id,
          fileName: patientDocuments.fileName,
          originalName: patientDocuments.originalName,
          fileType: patientDocuments.fileType,
          fileSize: patientDocuments.fileSize,
          category: patientDocuments.category,
          status: patientDocuments.status,
          uploadDate: patientDocuments.uploadDate,
          reviewDate: patientDocuments.reviewDate,
          reviewNotes: patientDocuments.reviewNotes
        })
        .from(patientDocuments)
        .where(eq(patientDocuments.patientId, patientId));

      // Adicionar URL para acessar cada documento
      const documentsWithUrl = documents.map(doc => ({
        ...doc,
        url: `/uploads/documents/${doc.fileName}`
      }));

      res.json(documentsWithUrl);
    } catch (error) {
      console.error('Erro ao buscar documentos do paciente:', error);
      res.status(500).json({ message: 'Erro ao buscar documentos' });
    }
  });

  // Rota para excluir um documento do paciente
  app.delete('/api/patient/documents/:id', isPatientMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);

      // Obter o ID do paciente
      const patientData = await db
        .select()
        .from(patients)
        .where(eq(patients.userId, req.user?.id as number));
      
      if (patientData.length === 0) {
        return res.status(404).json({ message: 'Perfil de paciente não encontrado' });
      }
      
      const patientId = patientData[0].id;

      // Buscar o documento para verificar se pertence ao paciente
      const document = await db
        .select()
        .from(patientDocuments)
        .where(
          and(
            eq(patientDocuments.id, documentId),
            eq(patientDocuments.patientId, patientId)
          )
        );

      if (document.length === 0) {
        return res.status(404).json({ message: 'Documento não encontrado ou não pertence ao paciente' });
      }

      // Não permitir excluir documentos já aprovados
      if (document[0].status === 'approved') {
        return res.status(400).json({ message: 'Documentos aprovados não podem ser excluídos' });
      }

      // Excluir o arquivo do sistema de arquivos
      const filePath = document[0].filePath;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Excluir o registro do banco de dados
      await db
        .delete(patientDocuments)
        .where(eq(patientDocuments.id, documentId));

      res.json({ message: 'Documento excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      res.status(500).json({ message: 'Erro ao excluir documento' });
    }
  });

  // ROTAS PARA FARMACÊUTICOS
  
  // Rota para listar documentos pendentes de revisão
  app.get('/api/pharmacist/documents/pending', isPharmacistMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const organizationId = req.user?.organizationId;

      // Buscar documentos pendentes da organização do farmacêutico
      const pendingDocuments = await db
        .select({
          id: patientDocuments.id,
          patientId: patientDocuments.patientId,
          fileName: patientDocuments.fileName,
          originalName: patientDocuments.originalName,
          fileType: patientDocuments.fileType,
          fileSize: patientDocuments.fileSize,
          category: patientDocuments.category,
          uploadDate: patientDocuments.uploadDate
        })
        .from(patientDocuments)
        .innerJoin(patients, eq(patientDocuments.patientId, patients.id))
        .where(
          and(
            eq(patientDocuments.organizationId, organizationId as number),
            eq(patientDocuments.status, 'pending')
          )
        );

      // Adicionar URL para acessar cada documento
      const documentsWithUrl = pendingDocuments.map(doc => ({
        ...doc,
        url: `/uploads/documents/${doc.fileName}`
      }));

      res.json(documentsWithUrl);
    } catch (error) {
      console.error('Erro ao buscar documentos pendentes:', error);
      res.status(500).json({ message: 'Erro ao buscar documentos pendentes' });
    }
  });

  // Rota para aprovar um documento
  app.post('/api/pharmacist/documents/:id/approve', isPharmacistMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      const pharmacistId = req.user?.id;
      const organizationId = req.user?.organizationId;
      const { notes } = req.body;

      // Verificar se o documento existe e pertence à organização do farmacêutico
      const document = await db
        .select()
        .from(patientDocuments)
        .where(
          and(
            eq(patientDocuments.id, documentId),
            eq(patientDocuments.organizationId, organizationId as number)
          )
        );

      if (document.length === 0) {
        return res.status(404).json({ message: 'Documento não encontrado' });
      }

      // Verificar se o documento está pendente
      if (document[0].status !== 'pending') {
        return res.status(400).json({
          message: 'Este documento já foi processado',
          status: document[0].status
        });
      }

      // Aprovar o documento
      await db
        .update(patientDocuments)
        .set({
          status: 'approved',
          reviewedById: pharmacistId,
          reviewDate: new Date(),
          reviewNotes: notes || null
        })
        .where(eq(patientDocuments.id, documentId));

      res.json({
        message: 'Documento aprovado com sucesso',
        documentId
      });
    } catch (error) {
      console.error('Erro ao aprovar documento:', error);
      res.status(500).json({ message: 'Erro ao aprovar documento' });
    }
  });

  // Rota para rejeitar um documento
  app.post('/api/pharmacist/documents/:id/reject', isPharmacistMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      const pharmacistId = req.user?.id;
      const organizationId = req.user?.organizationId;
      const { notes } = req.body;

      if (!notes) {
        return res.status(400).json({ message: 'É necessário fornecer um motivo para a rejeição' });
      }

      // Verificar se o documento existe e pertence à organização do farmacêutico
      const document = await db
        .select()
        .from(patientDocuments)
        .where(
          and(
            eq(patientDocuments.id, documentId),
            eq(patientDocuments.organizationId, organizationId as number)
          )
        );

      if (document.length === 0) {
        return res.status(404).json({ message: 'Documento não encontrado' });
      }

      // Verificar se o documento está pendente
      if (document[0].status !== 'pending') {
        return res.status(400).json({
          message: 'Este documento já foi processado',
          status: document[0].status
        });
      }

      // Rejeitar o documento
      await db
        .update(patientDocuments)
        .set({
          status: 'rejected',
          reviewedById: pharmacistId,
          reviewDate: new Date(),
          reviewNotes: notes
        })
        .where(eq(patientDocuments.id, documentId));

      res.json({
        message: 'Documento rejeitado com sucesso',
        documentId
      });
    } catch (error) {
      console.error('Erro ao rejeitar documento:', error);
      res.status(500).json({ message: 'Erro ao rejeitar documento' });
    }
  });

  // Rota para listar histórico de documentos processados
  app.get('/api/pharmacist/documents/history', isPharmacistMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const organizationId = req.user?.organizationId;
      const status = req.query.status as string; // 'approved' ou 'rejected'

      // Buscar documentos processados
      let documents;
      
      if (status === 'approved' || status === 'rejected') {
        // Filtrar por status específico
        documents = await db
          .select({
            id: patientDocuments.id,
            patientId: patientDocuments.patientId,
            fileName: patientDocuments.fileName,
            originalName: patientDocuments.originalName,
            fileType: patientDocuments.fileType,
            fileSize: patientDocuments.fileSize,
            category: patientDocuments.category,
            status: patientDocuments.status,
            uploadDate: patientDocuments.uploadDate,
            reviewDate: patientDocuments.reviewDate,
            reviewNotes: patientDocuments.reviewNotes
          })
          .from(patientDocuments)
          .innerJoin(patients, eq(patientDocuments.patientId, patients.id))
          .where(
            and(
              eq(patientDocuments.organizationId, organizationId as number),
              eq(patientDocuments.status, status)
            )
          );
      } else {
        // Mostrar todos os documentos processados (não pendentes)
        documents = await db
          .select({
            id: patientDocuments.id,
            patientId: patientDocuments.patientId,
            fileName: patientDocuments.fileName,
            originalName: patientDocuments.originalName,
            fileType: patientDocuments.fileType,
            fileSize: patientDocuments.fileSize,
            category: patientDocuments.category,
            status: patientDocuments.status,
            uploadDate: patientDocuments.uploadDate,
            reviewDate: patientDocuments.reviewDate,
            reviewNotes: patientDocuments.reviewNotes
          })
          .from(patientDocuments)
          .innerJoin(patients, eq(patientDocuments.patientId, patients.id))
          .where(
            and(
              eq(patientDocuments.organizationId, organizationId as number),
              ne(patientDocuments.status, 'pending' as any)
            )
          );
      }

      // Adicionar URL para acessar cada documento
      const documentsWithUrl = documents.map(doc => ({
        ...doc,
        url: `/uploads/documents/${doc.fileName}`
      }));

      res.json(documentsWithUrl);
    } catch (error) {
      console.error('Erro ao buscar histórico de documentos:', error);
      res.status(500).json({ message: 'Erro ao buscar histórico de documentos' });
    }
  });

  // Retornar as rotas registradas para debugging
  return [
    "/api/patient/documents",
    "/api/patient/documents/:id",
    "/api/pharmacist/documents/pending",
    "/api/pharmacist/documents/:id/approve",
    "/api/pharmacist/documents/:id/reject",
    "/api/pharmacist/documents/history"
  ];
}