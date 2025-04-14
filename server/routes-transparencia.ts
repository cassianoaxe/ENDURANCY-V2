import { Express, Request, Response } from "express";
import { 
  documentosTransparencia, 
  insertDocumentoTransparenciaSchema, 
  certificacoesOrganizacao, 
  insertCertificacaoSchema,
  membrosTransparencia,
  insertMembroTransparenciaSchema,
  relatoriosFinanceirosPublicos,
  insertRelatorioFinanceiroPublicoSchema
} from "@shared/schema-transparencia";
import { organizations } from "@shared/schema";
import { db } from "./db";
import { and, eq, like, or, desc, isNull, gte, lte } from "drizzle-orm";
import { authenticate } from "./routes";
import { zodErrorToReadableMessages } from "./utils";
import path from "path";
import fs from "fs";
import multer from "multer";

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/transparencia';
    if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Aceita PDF, DOCX, XLSX, PNG, JPG
    const allowedTypes = ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

/**
 * Verifica se uma organização pode ter portal de transparência
 * Incluímos tipos: associacao, Empresa ou quaisquer organizações com ID 32 (hempmeds)
 */
async function isAssociationOrganization(organizationId: number): Promise<boolean> {
  // Permitir especificamente a organização hempmeds (ID 32)
  if (organizationId === 32) {
    return true;
  }
  
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, organizationId)
  });
  
  // Permitir associações e empresas
  return org?.type === 'associacao' || org?.type === 'Empresa';
}

export function registerTransparenciaRoutes(app: Express) {
  // =========================================================
  // DOCUMENTOS DE TRANSPARÊNCIA
  // =========================================================
  
  /**
   * Rota para obter documentos públicos de uma organização - PÚBLICA (sem autenticação)
   */
  app.get('/api/public/transparencia/organizacao/:orgId/documentos', async (req: Request, res: Response) => {
    try {
      const { orgId } = req.params;
      const { categoria } = req.query;
      
      // Verifica se é uma associação
      const isAssociation = await isAssociationOrganization(parseInt(orgId));
      if (!isAssociation) {
        return res.status(404).json({ message: 'Portal de transparência não disponível para esta organização' });
      }
      
      let query = db.select()
        .from(documentosTransparencia)
        .where(
          and(
            eq(documentosTransparencia.organizacaoId, parseInt(orgId)),
            eq(documentosTransparencia.visibilidade, 'publico')
          )
        )
        .orderBy(desc(documentosTransparencia.dataDocumento));
      
      // Filtrar por categoria se especificada
      if (categoria && typeof categoria === 'string') {
        query = db.select()
          .from(documentosTransparencia)
          .where(
            and(
              eq(documentosTransparencia.organizacaoId, parseInt(orgId)),
              eq(documentosTransparencia.visibilidade, 'publico'),
              eq(documentosTransparencia.categoria, categoria as any)
            )
          )
          .orderBy(desc(documentosTransparencia.dataDocumento));
      }
      
      const documentos = await query;
      res.json(documentos);
    } catch (error) {
      console.error('Erro ao buscar documentos de transparência:', error);
      res.status(500).json({ message: 'Erro ao buscar documentos' });
    }
  });

  /**
   * Rota para obter todas as certificações públicas - PÚBLICA (sem autenticação)
   */
  app.get('/api/public/transparencia/organizacao/:orgId/certificacoes', async (req: Request, res: Response) => {
    try {
      const { orgId } = req.params;
      const { tipo } = req.query;
      
      // Verifica se é uma associação
      const isAssociation = await isAssociationOrganization(parseInt(orgId));
      if (!isAssociation) {
        return res.status(404).json({ message: 'Portal de transparência não disponível para esta organização' });
      }
      
      let query = db.select()
        .from(certificacoesOrganizacao)
        .where(
          and(
            eq(certificacoesOrganizacao.organizacaoId, parseInt(orgId)),
            eq(certificacoesOrganizacao.visibilidade, 'publico'),
            eq(certificacoesOrganizacao.status, 'ativo')
          )
        )
        .orderBy(desc(certificacoesOrganizacao.dataEmissao));
      
      // Filtrar por tipo se especificado
      if (tipo && typeof tipo === 'string') {
        query = db.select()
          .from(certificacoesOrganizacao)
          .where(
            and(
              eq(certificacoesOrganizacao.organizacaoId, parseInt(orgId)),
              eq(certificacoesOrganizacao.visibilidade, 'publico'),
              eq(certificacoesOrganizacao.status, 'ativo'),
              eq(certificacoesOrganizacao.tipo, tipo as any)
            )
          )
          .orderBy(desc(certificacoesOrganizacao.dataEmissao));
      }
      
      const certificacoes = await query;
      res.json(certificacoes);
    } catch (error) {
      console.error('Erro ao buscar certificações:', error);
      res.status(500).json({ message: 'Erro ao buscar certificações' });
    }
  });

  /**
   * Rota para obter membros públicos - PÚBLICA (sem autenticação)
   */
  app.get('/api/public/transparencia/organizacao/:orgId/membros', async (req: Request, res: Response) => {
    try {
      const { orgId } = req.params;
      const { tipo } = req.query;
      
      // Verifica se é uma associação
      const isAssociation = await isAssociationOrganization(parseInt(orgId));
      if (!isAssociation) {
        return res.status(404).json({ message: 'Portal de transparência não disponível para esta organização' });
      }
      
      let query = db.select()
        .from(membrosTransparencia)
        .where(
          and(
            eq(membrosTransparencia.organizacaoId, parseInt(orgId)),
            eq(membrosTransparencia.visibilidade, 'publico'),
            eq(membrosTransparencia.status, true)
          )
        )
        .orderBy(membrosTransparencia.nome);
      
      // Filtrar por tipo se especificado
      if (tipo && typeof tipo === 'string') {
        query = db.select()
          .from(membrosTransparencia)
          .where(
            and(
              eq(membrosTransparencia.organizacaoId, parseInt(orgId)),
              eq(membrosTransparencia.visibilidade, 'publico'),
              eq(membrosTransparencia.status, true),
              eq(membrosTransparencia.tipo, tipo as any)
            )
          )
          .orderBy(membrosTransparencia.nome);
      }
      
      const membros = await query;
      
      // Para proteção de dados, remover emails na versão pública
      const membrosPublicos = membros.map(m => ({
        ...m,
        email: m.email ? `${m.email.charAt(0)}*****@${m.email.split('@')[1]}` : null
      }));
      
      res.json(membrosPublicos);
    } catch (error) {
      console.error('Erro ao buscar membros:', error);
      res.status(500).json({ message: 'Erro ao buscar membros' });
    }
  });

  /**
   * Rota para obter relatórios financeiros públicos - PÚBLICA (sem autenticação)
   */
  app.get('/api/public/transparencia/organizacao/:orgId/financeiro', async (req: Request, res: Response) => {
    try {
      const { orgId } = req.params;
      const { ano } = req.query;
      
      // Verifica se é uma associação
      const isAssociation = await isAssociationOrganization(parseInt(orgId));
      if (!isAssociation) {
        return res.status(404).json({ message: 'Portal de transparência não disponível para esta organização' });
      }
      
      let query = db.select()
        .from(relatoriosFinanceirosPublicos)
        .where(
          and(
            eq(relatoriosFinanceirosPublicos.organizacaoId, parseInt(orgId)),
            eq(relatoriosFinanceirosPublicos.visibilidade, 'publico'),
            eq(relatoriosFinanceirosPublicos.publicado, true)
          )
        )
        .orderBy(desc(relatoriosFinanceirosPublicos.ano), desc(relatoriosFinanceirosPublicos.mes));
      
      // Filtrar por ano se especificado
      if (ano && typeof ano === 'string') {
        query = db.select()
          .from(relatoriosFinanceirosPublicos)
          .where(
            and(
              eq(relatoriosFinanceirosPublicos.organizacaoId, parseInt(orgId)),
              eq(relatoriosFinanceirosPublicos.visibilidade, 'publico'),
              eq(relatoriosFinanceirosPublicos.publicado, true),
              eq(relatoriosFinanceirosPublicos.ano, parseInt(ano))
            )
          )
          .orderBy(desc(relatoriosFinanceirosPublicos.mes));
      }
      
      const relatorios = await query;
      
      // Processar os campos JSON
      const processedRelatorios = relatorios.map(relatorio => ({
        ...relatorio,
        receitasPorCategoria: relatorio.receitasPorCategoria ? JSON.parse(relatorio.receitasPorCategoria) : null,
        despesasPorCategoria: relatorio.despesasPorCategoria ? JSON.parse(relatorio.despesasPorCategoria) : null,
        receitasMensais: relatorio.receitasMensais ? JSON.parse(relatorio.receitasMensais) : null,
        despesasMensais: relatorio.despesasMensais ? JSON.parse(relatorio.despesasMensais) : null
      }));
      
      res.json(processedRelatorios);
    } catch (error) {
      console.error('Erro ao buscar relatórios financeiros:', error);
      res.status(500).json({ message: 'Erro ao buscar relatórios financeiros' });
    }
  });

  /**
   * Rota para obter dados gerais da organização - PÚBLICA (sem autenticação)
   */
  app.get('/api/public/transparencia/organizacao/:orgId', async (req: Request, res: Response) => {
    try {
      const { orgId } = req.params;
      
      // Verifica se é uma associação
      const isAssociation = await isAssociationOrganization(parseInt(orgId));
      if (!isAssociation) {
        return res.status(404).json({ message: 'Portal de transparência não disponível para esta organização' });
      }
      
      const org = await db.query.organizations.findFirst({
        where: eq(organizations.id, parseInt(orgId))
      });
      
      if (!org) {
        return res.status(404).json({ message: 'Organização não encontrada' });
      }
      
      // Dados públicos da organização
      const orgPublicData = {
        id: org.id,
        name: org.name,
        type: org.type,
        cnpj: org.cnpj,
        website: org.website,
        address: org.address
      };
      
      res.json(orgPublicData);
    } catch (error) {
      console.error('Erro ao buscar dados da organização:', error);
      res.status(500).json({ message: 'Erro ao buscar dados da organização' });
    }
  });

  // =========================================================
  // ROTAS PARA GESTÃO INTERNA (REQUEREM AUTENTICAÇÃO)
  // =========================================================

  /**
   * Rota para listar todos os documentos de transparência (admin)
   */
  app.get('/api/transparencia/documentos', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizacaoId, categoria, visibilidade, search } = req.query;
      
      // Verificar permissão
      if (req.session.user.role !== 'admin' && 
          (req.session.user.role !== 'org_admin' || 
           req.session.user.organizationId !== parseInt(organizacaoId as string))) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      let query = db.select()
        .from(documentosTransparencia);
      
      const conditions = [];
      
      // Filtrar por organização
      if (organizacaoId) {
        conditions.push(eq(documentosTransparencia.organizacaoId, parseInt(organizacaoId as string)));
      } else if (req.session.user.role === 'org_admin' && req.session.user.organizationId) {
        // Org admin só pode ver da sua organização
        conditions.push(eq(documentosTransparencia.organizacaoId, req.session.user.organizationId));
      }
      
      // Filtrar por categoria
      if (categoria && typeof categoria === 'string') {
        conditions.push(eq(documentosTransparencia.categoria, categoria as any));
      }
      
      // Filtrar por visibilidade
      if (visibilidade && typeof visibilidade === 'string') {
        conditions.push(eq(documentosTransparencia.visibilidade, visibilidade as any));
      }
      
      // Filtrar por busca
      if (search && typeof search === 'string') {
        conditions.push(
          or(
            like(documentosTransparencia.titulo, `%${search}%`),
            like(documentosTransparencia.descricao || '', `%${search}%`)
          )
        );
      }
      
      if (conditions.length > 0) {
        query = db.select()
          .from(documentosTransparencia)
          .where(and(...conditions));
      }
      
      const documentos = await query.orderBy(desc(documentosTransparencia.dataDocumento));
      res.json(documentos);
    } catch (error) {
      console.error('Erro ao listar documentos:', error);
      res.status(500).json({ message: 'Erro ao buscar documentos' });
    }
  });

  /**
   * Rota para criar um novo documento de transparência
   */
  app.post('/api/transparencia/documentos', authenticate, upload.single('arquivo'), async (req: Request, res: Response) => {
    try {
      const { organizacaoId } = req.body;
      
      // Verificar permissão
      if (req.session.user.role !== 'admin' && 
          (req.session.user.role !== 'org_admin' || 
           req.session.user.organizationId !== parseInt(organizacaoId))) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      // Verificar se a organização é uma associação
      const isAssociation = await isAssociationOrganization(parseInt(organizacaoId));
      if (!isAssociation) {
        return res.status(400).json({ message: 'Apenas organizações do tipo associação podem ter documentos de transparência' });
      }
      
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: 'É obrigatório enviar um arquivo' });
      }
      
      // Validar e processar dados
      try {
        // Definir valores para o arquivo
        const arquivoUrl = `/uploads/transparencia/${file.filename}`;
        const arquivoTipo = path.extname(file.originalname).replace('.', '').toUpperCase();
        const arquivoTamanho = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
        
        const documentoData = {
          ...req.body,
          arquivoUrl,
          arquivoTipo,
          arquivoTamanho,
          criadoPor: req.session.user.id,
          dataDocumento: req.body.dataDocumento ? new Date(req.body.dataDocumento) : new Date()
        };
        
        const validatedData = insertDocumentoTransparenciaSchema.parse(documentoData);
        
        // Inserir no banco
        const [documento] = await db.insert(documentosTransparencia)
          .values(validatedData)
          .returning();
        
        res.status(201).json(documento);
      } catch (error: any) {
        // Se houver erro na validação, apagar o arquivo para evitar arquivos órfãos
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        
        console.error('Erro de validação:', error);
        
        if (error.errors) {
          return res.status(400).json({
            message: 'Erro de validação',
            errors: zodErrorToReadableMessages(error)
          });
        }
        
        throw error;
      }
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      res.status(500).json({ message: 'Erro ao criar documento' });
    }
  });

  /**
   * Rota para atualizar um documento
   */
  app.put('/api/transparencia/documentos/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Buscar documento atual
      const documento = await db.query.documentosTransparencia.findFirst({
        where: eq(documentosTransparencia.id, parseInt(id))
      });
      
      if (!documento) {
        return res.status(404).json({ message: 'Documento não encontrado' });
      }
      
      // Verificar permissão
      if (req.session.user.role !== 'admin' && 
          (req.session.user.role !== 'org_admin' || 
           req.session.user.organizationId !== documento.organizacaoId)) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      // Atualizar dados permitidos (não podemos alterar o arquivo - isso requere um novo endpoint)
      const updateData = {
        ...req.body,
        atualizadoPor: req.session.user.id,
        atualizadoEm: new Date()
      };
      
      // Remover campos que não podem ser atualizados
      delete updateData.arquivoUrl;
      delete updateData.arquivoTipo;
      delete updateData.arquivoTamanho;
      delete updateData.criadoPor;
      delete updateData.criadoEm;
      delete updateData.organizacaoId; // Não permitir mudar de organização
      
      const [documentoAtualizado] = await db.update(documentosTransparencia)
        .set(updateData)
        .where(eq(documentosTransparencia.id, parseInt(id)))
        .returning();
      
      res.json(documentoAtualizado);
    } catch (error) {
      console.error('Erro ao atualizar documento:', error);
      res.status(500).json({ message: 'Erro ao atualizar documento' });
    }
  });

  /**
   * Rota para excluir um documento
   */
  app.delete('/api/transparencia/documentos/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Buscar documento atual
      const documento = await db.query.documentosTransparencia.findFirst({
        where: eq(documentosTransparencia.id, parseInt(id))
      });
      
      if (!documento) {
        return res.status(404).json({ message: 'Documento não encontrado' });
      }
      
      // Verificar permissão
      if (req.session.user.role !== 'admin' && 
          (req.session.user.role !== 'org_admin' || 
           req.session.user.organizationId !== documento.organizacaoId)) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      // Excluir o arquivo físico
      if (documento.arquivoUrl) {
        const filePath = path.join(process.cwd(), documento.arquivoUrl.replace(/^\//, ''));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      // Excluir do banco
      await db.delete(documentosTransparencia)
        .where(eq(documentosTransparencia.id, parseInt(id)));
      
      res.json({ message: 'Documento excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      res.status(500).json({ message: 'Erro ao excluir documento' });
    }
  });

  // =========================================================
  // ROTAS PARA CERTIFICAÇÕES
  // =========================================================

  /**
   * Rota para listar certificações
   */
  app.get('/api/transparencia/certificacoes', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizacaoId, tipo, status } = req.query;
      
      // Verificar permissão
      if (req.session.user.role !== 'admin' && 
          (req.session.user.role !== 'org_admin' || 
           req.session.user.organizationId !== parseInt(organizacaoId as string))) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      let query = db.select()
        .from(certificacoesOrganizacao);
      
      const conditions = [];
      
      // Filtrar por organização
      if (organizacaoId) {
        conditions.push(eq(certificacoesOrganizacao.organizacaoId, parseInt(organizacaoId as string)));
      } else if (req.session.user.role === 'org_admin' && req.session.user.organizationId) {
        // Org admin só pode ver da sua organização
        conditions.push(eq(certificacoesOrganizacao.organizacaoId, req.session.user.organizationId));
      }
      
      // Filtrar por tipo
      if (tipo && typeof tipo === 'string') {
        conditions.push(eq(certificacoesOrganizacao.tipo, tipo as any));
      }
      
      // Filtrar por status
      if (status && typeof status === 'string') {
        conditions.push(eq(certificacoesOrganizacao.status, status as any));
      }
      
      if (conditions.length > 0) {
        query = db.select()
          .from(certificacoesOrganizacao)
          .where(and(...conditions));
      }
      
      const certificacoes = await query.orderBy(desc(certificacoesOrganizacao.dataEmissao));
      res.json(certificacoes);
    } catch (error) {
      console.error('Erro ao listar certificações:', error);
      res.status(500).json({ message: 'Erro ao buscar certificações' });
    }
  });

  /**
   * Rota para criar uma certificação
   */
  app.post('/api/transparencia/certificacoes', authenticate, upload.single('arquivo'), async (req: Request, res: Response) => {
    try {
      const { organizacaoId } = req.body;
      
      // Verificar permissão
      if (req.session.user.role !== 'admin' && 
          (req.session.user.role !== 'org_admin' || 
           req.session.user.organizationId !== parseInt(organizacaoId))) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      // Verificar se a organização é uma associação
      const isAssociation = await isAssociationOrganization(parseInt(organizacaoId));
      if (!isAssociation) {
        return res.status(400).json({ message: 'Apenas organizações do tipo associação podem ter certificações de transparência' });
      }
      
      // Processar arquivo opcional
      let arquivoUrl = '';
      let arquivoTipo = '';
      
      if (req.file) {
        arquivoUrl = `/uploads/transparencia/${req.file.filename}`;
        arquivoTipo = path.extname(req.file.originalname).replace('.', '').toUpperCase();
      }
      
      try {
        const certificacaoData = {
          ...req.body,
          arquivoUrl: arquivoUrl || undefined,
          dataEmissao: req.body.dataEmissao ? new Date(req.body.dataEmissao) : new Date(),
          dataValidade: req.body.dataValidade ? new Date(req.body.dataValidade) : undefined,
          criadoPor: req.session.user.id
        };
        
        const validatedData = insertCertificacaoSchema.parse(certificacaoData);
        
        // Inserir no banco
        const [certificacao] = await db.insert(certificacoesOrganizacao)
          .values(validatedData)
          .returning();
        
        res.status(201).json(certificacao);
      } catch (error: any) {
        // Se houver erro na validação e tiver arquivo, apagar o arquivo
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
        console.error('Erro de validação:', error);
        
        if (error.errors) {
          return res.status(400).json({
            message: 'Erro de validação',
            errors: zodErrorToReadableMessages(error)
          });
        }
        
        throw error;
      }
    } catch (error) {
      console.error('Erro ao criar certificação:', error);
      res.status(500).json({ message: 'Erro ao criar certificação' });
    }
  });

  /**
   * Rota para atualizar uma certificação
   */
  app.put('/api/transparencia/certificacoes/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Buscar certificação atual
      const certificacao = await db.query.certificacoesOrganizacao.findFirst({
        where: eq(certificacoesOrganizacao.id, parseInt(id))
      });
      
      if (!certificacao) {
        return res.status(404).json({ message: 'Certificação não encontrada' });
      }
      
      // Verificar permissão
      if (req.session.user.role !== 'admin' && 
          (req.session.user.role !== 'org_admin' || 
           req.session.user.organizationId !== certificacao.organizacaoId)) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      // Processar datas
      const updateData = {
        ...req.body,
        dataEmissao: req.body.dataEmissao ? new Date(req.body.dataEmissao) : certificacao.dataEmissao,
        dataValidade: req.body.dataValidade ? new Date(req.body.dataValidade) : certificacao.dataValidade,
        atualizadoPor: req.session.user.id,
        atualizadoEm: new Date()
      };
      
      // Remover campos que não podem ser atualizados
      delete updateData.arquivoUrl;
      delete updateData.criadoPor;
      delete updateData.criadoEm;
      delete updateData.organizacaoId; // Não permitir mudar de organização
      
      const [certificacaoAtualizada] = await db.update(certificacoesOrganizacao)
        .set(updateData)
        .where(eq(certificacoesOrganizacao.id, parseInt(id)))
        .returning();
      
      res.json(certificacaoAtualizada);
    } catch (error) {
      console.error('Erro ao atualizar certificação:', error);
      res.status(500).json({ message: 'Erro ao atualizar certificação' });
    }
  });

  /**
   * Rota para excluir uma certificação
   */
  app.delete('/api/transparencia/certificacoes/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Buscar certificação atual
      const certificacao = await db.query.certificacoesOrganizacao.findFirst({
        where: eq(certificacoesOrganizacao.id, parseInt(id))
      });
      
      if (!certificacao) {
        return res.status(404).json({ message: 'Certificação não encontrada' });
      }
      
      // Verificar permissão
      if (req.session.user.role !== 'admin' && 
          (req.session.user.role !== 'org_admin' || 
           req.session.user.organizationId !== certificacao.organizacaoId)) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      // Excluir o arquivo físico se existir
      if (certificacao.arquivoUrl) {
        const filePath = path.join(process.cwd(), certificacao.arquivoUrl.replace(/^\//, ''));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      // Excluir do banco
      await db.delete(certificacoesOrganizacao)
        .where(eq(certificacoesOrganizacao.id, parseInt(id)));
      
      res.json({ message: 'Certificação excluída com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir certificação:', error);
      res.status(500).json({ message: 'Erro ao excluir certificação' });
    }
  });

  // =========================================================
  // ROTAS PARA MEMBROS DA TRANSPARÊNCIA
  // =========================================================

  /**
   * Rota para listar membros para transparência
   */
  app.get('/api/transparencia/membros', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizacaoId, tipo, status } = req.query;
      
      // Verificar permissão
      if (req.session.user.role !== 'admin' && 
          (req.session.user.role !== 'org_admin' || 
           req.session.user.organizationId !== parseInt(organizacaoId as string))) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      let query = db.select()
        .from(membrosTransparencia);
      
      const conditions = [];
      
      // Filtrar por organização
      if (organizacaoId) {
        conditions.push(eq(membrosTransparencia.organizacaoId, parseInt(organizacaoId as string)));
      } else if (req.session.user.role === 'org_admin' && req.session.user.organizationId) {
        // Org admin só pode ver da sua organização
        conditions.push(eq(membrosTransparencia.organizacaoId, req.session.user.organizationId));
      }
      
      // Filtrar por tipo
      if (tipo && typeof tipo === 'string') {
        conditions.push(eq(membrosTransparencia.tipo, tipo as any));
      }
      
      // Filtrar por status
      if (status !== undefined) {
        const statusBool = status === 'true' || status === '1';
        conditions.push(eq(membrosTransparencia.status, statusBool));
      }
      
      if (conditions.length > 0) {
        query = db.select()
          .from(membrosTransparencia)
          .where(and(...conditions));
      }
      
      const membros = await query.orderBy(membrosTransparencia.nome);
      res.json(membros);
    } catch (error) {
      console.error('Erro ao listar membros:', error);
      res.status(500).json({ message: 'Erro ao buscar membros' });
    }
  });

  /**
   * Rota para adicionar um membro
   */
  app.post('/api/transparencia/membros', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizacaoId } = req.body;
      
      // Verificar permissão
      if (req.session.user.role !== 'admin' && 
          (req.session.user.role !== 'org_admin' || 
           req.session.user.organizationId !== parseInt(organizacaoId))) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      // Verificar se a organização é uma associação
      const isAssociation = await isAssociationOrganization(parseInt(organizacaoId));
      if (!isAssociation) {
        return res.status(400).json({ message: 'Apenas organizações do tipo associação podem ter membros de transparência' });
      }
      
      try {
        const membroData = {
          ...req.body,
          dataIngresso: req.body.dataIngresso ? new Date(req.body.dataIngresso) : new Date(),
          criadoPor: req.session.user.id
        };
        
        const validatedData = insertMembroTransparenciaSchema.parse(membroData);
        
        // Inserir no banco
        const [membro] = await db.insert(membrosTransparencia)
          .values(validatedData)
          .returning();
        
        res.status(201).json(membro);
      } catch (error: any) {
        console.error('Erro de validação:', error);
        
        if (error.errors) {
          return res.status(400).json({
            message: 'Erro de validação',
            errors: zodErrorToReadableMessages(error)
          });
        }
        
        throw error;
      }
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      res.status(500).json({ message: 'Erro ao adicionar membro' });
    }
  });

  /**
   * Rota para atualizar um membro
   */
  app.put('/api/transparencia/membros/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Buscar membro atual
      const membro = await db.query.membrosTransparencia.findFirst({
        where: eq(membrosTransparencia.id, parseInt(id))
      });
      
      if (!membro) {
        return res.status(404).json({ message: 'Membro não encontrado' });
      }
      
      // Verificar permissão
      if (req.session.user.role !== 'admin' && 
          (req.session.user.role !== 'org_admin' || 
           req.session.user.organizationId !== membro.organizacaoId)) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      // Processar datas
      const updateData = {
        ...req.body,
        dataIngresso: req.body.dataIngresso ? new Date(req.body.dataIngresso) : membro.dataIngresso,
        atualizadoPor: req.session.user.id,
        atualizadoEm: new Date()
      };
      
      // Remover campos que não podem ser atualizados
      delete updateData.criadoPor;
      delete updateData.criadoEm;
      delete updateData.organizacaoId; // Não permitir mudar de organização
      
      const [membroAtualizado] = await db.update(membrosTransparencia)
        .set(updateData)
        .where(eq(membrosTransparencia.id, parseInt(id)))
        .returning();
      
      res.json(membroAtualizado);
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
      res.status(500).json({ message: 'Erro ao atualizar membro' });
    }
  });

  /**
   * Rota para excluir um membro
   */
  app.delete('/api/transparencia/membros/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Buscar membro atual
      const membro = await db.query.membrosTransparencia.findFirst({
        where: eq(membrosTransparencia.id, parseInt(id))
      });
      
      if (!membro) {
        return res.status(404).json({ message: 'Membro não encontrado' });
      }
      
      // Verificar permissão
      if (req.session.user.role !== 'admin' && 
          (req.session.user.role !== 'org_admin' || 
           req.session.user.organizationId !== membro.organizacaoId)) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      // Excluir do banco
      await db.delete(membrosTransparencia)
        .where(eq(membrosTransparencia.id, parseInt(id)));
      
      res.json({ message: 'Membro excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir membro:', error);
      res.status(500).json({ message: 'Erro ao excluir membro' });
    }
  });

  // =========================================================
  // ROTAS PARA RELATÓRIOS FINANCEIROS PÚBLICOS
  // =========================================================

  /**
   * Rota para listar relatórios financeiros
   */
  app.get('/api/transparencia/financeiro', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizacaoId, ano, publicado } = req.query;
      
      // Verificar permissão
      if (req.session.user.role !== 'admin' && 
          (req.session.user.role !== 'org_admin' || 
           req.session.user.organizationId !== parseInt(organizacaoId as string))) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      let query = db.select()
        .from(relatoriosFinanceirosPublicos);
      
      const conditions = [];
      
      // Filtrar por organização
      if (organizacaoId) {
        conditions.push(eq(relatoriosFinanceirosPublicos.organizacaoId, parseInt(organizacaoId as string)));
      } else if (req.session.user.role === 'org_admin' && req.session.user.organizationId) {
        // Org admin só pode ver da sua organização
        conditions.push(eq(relatoriosFinanceirosPublicos.organizacaoId, req.session.user.organizationId));
      }
      
      // Filtrar por ano
      if (ano && typeof ano === 'string') {
        conditions.push(eq(relatoriosFinanceirosPublicos.ano, parseInt(ano)));
      }
      
      // Filtrar por status de publicação
      if (publicado !== undefined) {
        const publicadoBool = publicado === 'true' || publicado === '1';
        conditions.push(eq(relatoriosFinanceirosPublicos.publicado, publicadoBool));
      }
      
      if (conditions.length > 0) {
        query = db.select()
          .from(relatoriosFinanceirosPublicos)
          .where(and(...conditions));
      }
      
      const relatorios = await query.orderBy(desc(relatoriosFinanceirosPublicos.ano), desc(relatoriosFinanceirosPublicos.mes));
      
      // Processar os campos JSON
      const processedRelatorios = relatorios.map(relatorio => ({
        ...relatorio,
        receitasPorCategoria: relatorio.receitasPorCategoria ? JSON.parse(relatorio.receitasPorCategoria) : null,
        despesasPorCategoria: relatorio.despesasPorCategoria ? JSON.parse(relatorio.despesasPorCategoria) : null,
        receitasMensais: relatorio.receitasMensais ? JSON.parse(relatorio.receitasMensais) : null,
        despesasMensais: relatorio.despesasMensais ? JSON.parse(relatorio.despesasMensais) : null
      }));
      
      res.json(processedRelatorios);
    } catch (error) {
      console.error('Erro ao listar relatórios financeiros:', error);
      res.status(500).json({ message: 'Erro ao buscar relatórios financeiros' });
    }
  });

  /**
   * Rota para criar um relatório financeiro público
   */
  app.post('/api/transparencia/financeiro', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizacaoId } = req.body;
      
      // Verificar permissão
      if (req.session.user.role !== 'admin' && 
          (req.session.user.role !== 'org_admin' || 
           req.session.user.organizationId !== parseInt(organizacaoId))) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      // Verificar se a organização é uma associação
      const isAssociation = await isAssociationOrganization(parseInt(organizacaoId));
      if (!isAssociation) {
        return res.status(400).json({ message: 'Apenas organizações do tipo associação podem ter relatórios financeiros públicos' });
      }
      
      try {
        // Processar campos JSON
        const relatorioData = {
          ...req.body,
          criadoPor: req.session.user.id,
          receitasPorCategoria: req.body.receitasPorCategoria ? JSON.stringify(req.body.receitasPorCategoria) : null,
          despesasPorCategoria: req.body.despesasPorCategoria ? JSON.stringify(req.body.despesasPorCategoria) : null,
          receitasMensais: req.body.receitasMensais ? JSON.stringify(req.body.receitasMensais) : null,
          despesasMensais: req.body.despesasMensais ? JSON.stringify(req.body.despesasMensais) : null
        };
        
        const validatedData = insertRelatorioFinanceiroPublicoSchema.parse(relatorioData);
        
        // Verificar se já existe um relatório para este ano/mês e organização
        if (validatedData.mes) {
          const relatorioExistente = await db.query.relatoriosFinanceirosPublicos.findFirst({
            where: and(
              eq(relatoriosFinanceirosPublicos.organizacaoId, validatedData.organizacaoId),
              eq(relatoriosFinanceirosPublicos.ano, validatedData.ano),
              eq(relatoriosFinanceirosPublicos.mes, validatedData.mes)
            )
          });
          
          if (relatorioExistente) {
            return res.status(400).json({ 
              message: `Já existe um relatório financeiro para o mês ${validatedData.mes}/${validatedData.ano}` 
            });
          }
        } else {
          // Se não tiver mês, é um relatório anual
          const relatorioExistente = await db.query.relatoriosFinanceirosPublicos.findFirst({
            where: and(
              eq(relatoriosFinanceirosPublicos.organizacaoId, validatedData.organizacaoId),
              eq(relatoriosFinanceirosPublicos.ano, validatedData.ano),
              isNull(relatoriosFinanceirosPublicos.mes)
            )
          });
          
          if (relatorioExistente) {
            return res.status(400).json({ 
              message: `Já existe um relatório financeiro anual para o ano ${validatedData.ano}` 
            });
          }
        }
        
        // Inserir no banco
        const [relatorio] = await db.insert(relatoriosFinanceirosPublicos)
          .values(validatedData)
          .returning();
        
        // Processar novamente os campos JSON para a resposta
        const processedRelatorio = {
          ...relatorio,
          receitasPorCategoria: relatorio.receitasPorCategoria ? JSON.parse(relatorio.receitasPorCategoria) : null,
          despesasPorCategoria: relatorio.despesasPorCategoria ? JSON.parse(relatorio.despesasPorCategoria) : null,
          receitasMensais: relatorio.receitasMensais ? JSON.parse(relatorio.receitasMensais) : null,
          despesasMensais: relatorio.despesasMensais ? JSON.parse(relatorio.despesasMensais) : null
        };
        
        res.status(201).json(processedRelatorio);
      } catch (error: any) {
        console.error('Erro de validação:', error);
        
        if (error.errors) {
          return res.status(400).json({
            message: 'Erro de validação',
            errors: zodErrorToReadableMessages(error)
          });
        }
        
        throw error;
      }
    } catch (error) {
      console.error('Erro ao criar relatório financeiro:', error);
      res.status(500).json({ message: 'Erro ao criar relatório financeiro' });
    }
  });

  /**
   * Rota para atualizar um relatório financeiro
   */
  app.put('/api/transparencia/financeiro/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Buscar relatório atual
      const relatorio = await db.query.relatoriosFinanceirosPublicos.findFirst({
        where: eq(relatoriosFinanceirosPublicos.id, parseInt(id))
      });
      
      if (!relatorio) {
        return res.status(404).json({ message: 'Relatório financeiro não encontrado' });
      }
      
      // Verificar permissão
      if (req.session.user.role !== 'admin' && 
          (req.session.user.role !== 'org_admin' || 
           req.session.user.organizationId !== relatorio.organizacaoId)) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      // Processar campos JSON
      const updateData = {
        ...req.body,
        atualizadoPor: req.session.user.id,
        atualizadoEm: new Date(),
        receitasPorCategoria: req.body.receitasPorCategoria ? JSON.stringify(req.body.receitasPorCategoria) : relatorio.receitasPorCategoria,
        despesasPorCategoria: req.body.despesasPorCategoria ? JSON.stringify(req.body.despesasPorCategoria) : relatorio.despesasPorCategoria,
        receitasMensais: req.body.receitasMensais ? JSON.stringify(req.body.receitasMensais) : relatorio.receitasMensais,
        despesasMensais: req.body.despesasMensais ? JSON.stringify(req.body.despesasMensais) : relatorio.despesasMensais
      };
      
      // Remover campos que não podem ser atualizados
      delete updateData.criadoPor;
      delete updateData.criadoEm;
      delete updateData.organizacaoId; // Não permitir mudar de organização
      delete updateData.ano; // Não permitir mudar o ano
      delete updateData.mes; // Não permitir mudar o mês
      
      const [relatorioAtualizado] = await db.update(relatoriosFinanceirosPublicos)
        .set(updateData)
        .where(eq(relatoriosFinanceirosPublicos.id, parseInt(id)))
        .returning();
      
      // Processar novamente os campos JSON para a resposta
      const processedRelatorio = {
        ...relatorioAtualizado,
        receitasPorCategoria: relatorioAtualizado.receitasPorCategoria ? JSON.parse(relatorioAtualizado.receitasPorCategoria) : null,
        despesasPorCategoria: relatorioAtualizado.despesasPorCategoria ? JSON.parse(relatorioAtualizado.despesasPorCategoria) : null,
        receitasMensais: relatorioAtualizado.receitasMensais ? JSON.parse(relatorioAtualizado.receitasMensais) : null,
        despesasMensais: relatorioAtualizado.despesasMensais ? JSON.parse(relatorioAtualizado.despesasMensais) : null
      };
      
      res.json(processedRelatorio);
    } catch (error) {
      console.error('Erro ao atualizar relatório financeiro:', error);
      res.status(500).json({ message: 'Erro ao atualizar relatório financeiro' });
    }
  });

  /**
   * Rota para excluir um relatório financeiro
   */
  app.delete('/api/transparencia/financeiro/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Buscar relatório atual
      const relatorio = await db.query.relatoriosFinanceirosPublicos.findFirst({
        where: eq(relatoriosFinanceirosPublicos.id, parseInt(id))
      });
      
      if (!relatorio) {
        return res.status(404).json({ message: 'Relatório financeiro não encontrado' });
      }
      
      // Verificar permissão
      if (req.session.user.role !== 'admin' && 
          (req.session.user.role !== 'org_admin' || 
           req.session.user.organizationId !== relatorio.organizacaoId)) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      // Excluir do banco
      await db.delete(relatoriosFinanceirosPublicos)
        .where(eq(relatoriosFinanceirosPublicos.id, parseInt(id)));
      
      res.json({ message: 'Relatório financeiro excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir relatório financeiro:', error);
      res.status(500).json({ message: 'Erro ao excluir relatório financeiro' });
    }
  });
}