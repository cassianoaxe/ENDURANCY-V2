import { Express, Request, Response } from "express";
import { pool } from "../db";
import { authenticate } from "../routes";
import { formatDate } from "../utils";

// Função para exportar e registrar todas as rotas de validação HPLC
export async function registerHplcValidationRoutes(app: Express) {
  // Middleware para verificar acesso ao módulo HPLC (reutilizado do arquivo hplc-routes.ts)
  const checkHplcAccess = async (req: Request, res: Response, next: Function) => {
    if (req.session?.user?.role !== 'laboratory' && req.session?.user?.role !== 'admin' && req.session?.user?.role !== 'employee') {
      return res.status(403).json({ message: "Acesso não autorizado ao módulo HPLC" });
    }
    next();
  };

  // Função auxiliar para obter o ID do laboratório associado ao usuário (reutilizada de hplc-routes.ts)
  async function getLaboratoryId(userId: number | undefined, userRole: string | undefined): Promise<number | null> {
    if (!userId) return null;
    
    // Administradores podem acessar todos os laboratórios
    if (userRole === 'admin') return null;
    
    try {
      const result = await pool.query(
        `SELECT organization_id FROM users WHERE id = $1 AND (role = 'laboratory' OR role = 'employee')`,
        [userId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      // Retornar o organization_id como laboratoryId
      return result.rows[0].organization_id;
    } catch (error) {
      console.error("Erro ao obter laboratoryId:", error);
      return null;
    }
  }

  /**
   * API de Validações de Métodos HPLC
   */
  app.get('/api/laboratory/hplc/validations', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const laboratoryId = await getLaboratoryId(req.session?.user?.id, req.session?.user?.role);
      
      // Buscar validações de métodos
      const validations = await pool.query(
        `SELECT v.*, 
          u.name as responsible_name, 
          cu.name as created_by_name
        FROM hplc_validations v
        LEFT JOIN users u ON v.responsible_id = u.id
        LEFT JOIN users cu ON v.created_by = cu.id
        WHERE ($1::int IS NULL OR v.laboratory_id = $1)
        ORDER BY v.created_at DESC`,
        [laboratoryId]
      );
      
      // Formatar dados para o cliente (camelCase)
      const formattedValidations = validations.rows.map(row => ({
        id: row.id,
        laboratoryId: row.laboratory_id,
        methodName: row.method_name,
        methodCode: row.method_code,
        analytes: row.analytes,
        matrix: row.matrix, 
        status: row.status,
        validationParameters: row.validation_parameters,
        validationStartDate: row.validation_start_date,
        validationEndDate: row.validation_end_date,
        responsibleId: row.responsible_id,
        responsibleName: row.responsible_name,
        equipment: row.equipment,
        column: row.column,
        analyticalConditions: row.analytical_conditions,
        notes: row.notes,
        results: row.results,
        progress: row.progress,
        documents: row.documents,
        createdBy: row.created_by,
        createdByName: row.created_by_name,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      
      res.status(200).json(formattedValidations);
    } catch (error) {
      console.error('Erro ao buscar validações:', error);
      res.status(500).json({ message: "Erro ao buscar validações de métodos" });
    }
  });
  
  app.get('/api/laboratory/hplc/validations/:id', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const validationId = parseInt(req.params.id);
      const laboratoryId = await getLaboratoryId(req.session?.user?.id, req.session?.user?.role);
      
      // Buscar validação específica
      const validation = await pool.query(
        `SELECT v.*, 
          u.name as responsible_name, 
          cu.name as created_by_name
        FROM hplc_validations v
        LEFT JOIN users u ON v.responsible_id = u.id
        LEFT JOIN users cu ON v.created_by = cu.id
        WHERE v.id = $1 AND ($2::int IS NULL OR v.laboratory_id = $2)`,
        [validationId, laboratoryId]
      );
      
      if (validation.rows.length === 0) {
        return res.status(404).json({ message: "Validação não encontrada" });
      }
      
      // Formatar dados para o cliente (camelCase)
      const row = validation.rows[0];
      const formattedValidation = {
        id: row.id,
        laboratoryId: row.laboratory_id,
        methodName: row.method_name,
        methodCode: row.method_code,
        analytes: row.analytes,
        matrix: row.matrix, 
        status: row.status,
        validationParameters: row.validation_parameters,
        validationStartDate: row.validation_start_date,
        validationEndDate: row.validation_end_date,
        responsibleId: row.responsible_id,
        responsibleName: row.responsible_name,
        equipment: row.equipment,
        column: row.column,
        analyticalConditions: row.analytical_conditions,
        notes: row.notes,
        results: row.results,
        progress: row.progress,
        documents: row.documents,
        createdBy: row.created_by,
        createdByName: row.created_by_name,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
      
      res.status(200).json(formattedValidation);
    } catch (error) {
      console.error('Erro ao buscar detalhes da validação:', error);
      res.status(500).json({ message: "Erro ao buscar detalhes da validação" });
    }
  });
  
  app.post('/api/laboratory/hplc/validations', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const laboratoryId = await getLaboratoryId(req.session?.user?.id, req.session?.user?.role);
      const userId = req.session?.user?.id;
      
      const {
        methodName,
        methodCode,
        analytes,
        matrix,
        status,
        validationParameters,
        validationStartDate,
        validationEndDate,
        responsibleId,
        equipment,
        column,
        analyticalConditions,
        notes,
        results,
        progress
      } = req.body;
      
      // Validar dados
      if (!methodName || !methodCode || !analytes || !matrix || !status || !validationParameters || !validationStartDate || !responsibleId) {
        return res.status(400).json({ message: "Dados incompletos" });
      }
      
      // Inserir validação
      const result = await pool.query(
        `INSERT INTO hplc_validations (
          laboratory_id, method_name, method_code, analytes, matrix,
          status, validation_parameters, validation_start_date, validation_end_date,
          responsible_id, equipment, column, analytical_conditions, notes, results,
          progress, created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
        RETURNING id`,
        [
          laboratoryId, methodName, methodCode, analytes, matrix,
          status, validationParameters, validationStartDate, validationEndDate || null,
          responsibleId, equipment || null, column || null, analyticalConditions || null, notes || null, results || null,
          progress || 0, userId
        ]
      );
      
      const newValidationId = result.rows[0].id;
      
      res.status(201).json({
        id: newValidationId,
        message: "Validação de método criada com sucesso"
      });
    } catch (error) {
      console.error('Erro ao criar validação de método:', error);
      res.status(500).json({ message: "Erro ao criar validação de método" });
    }
  });
  
  app.put('/api/laboratory/hplc/validations/:id', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const validationId = parseInt(req.params.id);
      const laboratoryId = await getLaboratoryId(req.session?.user?.id, req.session?.user?.role);
      
      const {
        methodName,
        methodCode,
        analytes,
        matrix,
        status,
        validationParameters,
        validationStartDate,
        validationEndDate,
        responsibleId,
        equipment,
        column,
        analyticalConditions,
        notes,
        results,
        progress
      } = req.body;
      
      // Validar dados
      if (!methodName || !methodCode || !analytes || !matrix || !status || !validationParameters || !validationStartDate || !responsibleId) {
        return res.status(400).json({ message: "Dados incompletos" });
      }
      
      // Verificar se a validação existe e pertence ao laboratório
      const checkValidation = await pool.query(
        'SELECT id FROM hplc_validations WHERE id = $1 AND ($2::int IS NULL OR laboratory_id = $2)',
        [validationId, laboratoryId]
      );
      
      if (checkValidation.rows.length === 0) {
        return res.status(404).json({ message: "Validação não encontrada" });
      }
      
      // Atualizar validação
      await pool.query(
        `UPDATE hplc_validations SET
          method_name = $1, method_code = $2, analytes = $3, matrix = $4,
          status = $5, validation_parameters = $6, validation_start_date = $7, validation_end_date = $8,
          responsible_id = $9, equipment = $10, column = $11, analytical_conditions = $12, notes = $13,
          results = $14, progress = $15, updated_at = NOW()
        WHERE id = $16 AND ($17::int IS NULL OR laboratory_id = $17)`,
        [
          methodName, methodCode, analytes, matrix,
          status, validationParameters, validationStartDate, validationEndDate || null,
          responsibleId, equipment || null, column || null, analyticalConditions || null, notes || null,
          results || null, progress || 0, validationId, laboratoryId
        ]
      );
      
      res.status(200).json({ message: "Validação atualizada com sucesso" });
    } catch (error) {
      console.error('Erro ao atualizar validação:', error);
      res.status(500).json({ message: "Erro ao atualizar validação" });
    }
  });
  
  app.delete('/api/laboratory/hplc/validations/:id', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const validationId = parseInt(req.params.id);
      const laboratoryId = await getLaboratoryId(req.session?.user?.id, req.session?.user?.role);
      
      // Verificar se a validação existe e pertence ao laboratório
      const checkValidation = await pool.query(
        'SELECT id FROM hplc_validations WHERE id = $1 AND ($2::int IS NULL OR laboratory_id = $2)',
        [validationId, laboratoryId]
      );
      
      if (checkValidation.rows.length === 0) {
        return res.status(404).json({ message: "Validação não encontrada" });
      }
      
      // Excluir todos os resultados de parâmetros associados
      await pool.query(
        'DELETE FROM hplc_validation_results WHERE validation_id = $1',
        [validationId]
      );
      
      // Excluir todos os documentos associados
      await pool.query(
        'DELETE FROM hplc_validation_documents WHERE validation_id = $1',
        [validationId]
      );
      
      // Excluir a validação
      await pool.query(
        'DELETE FROM hplc_validations WHERE id = $1 AND ($2::int IS NULL OR laboratory_id = $2)',
        [validationId, laboratoryId]
      );
      
      res.status(200).json({ message: "Validação excluída com sucesso" });
    } catch (error) {
      console.error('Erro ao excluir validação:', error);
      res.status(500).json({ message: "Erro ao excluir validação" });
    }
  });
  
  // Resultados de parâmetros de validação
  app.get('/api/laboratory/hplc/validations/:id/results', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const validationId = parseInt(req.params.id);
      const laboratoryId = await getLaboratoryId(req.session?.user?.id, req.session?.user?.role);
      
      // Verificar se a validação existe e pertence ao laboratório
      const checkValidation = await pool.query(
        'SELECT id FROM hplc_validations WHERE id = $1 AND ($2::int IS NULL OR laboratory_id = $2)',
        [validationId, laboratoryId]
      );
      
      if (checkValidation.rows.length === 0) {
        return res.status(404).json({ message: "Validação não encontrada" });
      }
      
      // Buscar resultados
      const results = await pool.query(
        `SELECT r.*, u.name as created_by_name
        FROM hplc_validation_results r
        LEFT JOIN users u ON r.created_by = u.id
        WHERE r.validation_id = $1
        ORDER BY r.created_at DESC`,
        [validationId]
      );
      
      // Formatar dados para o cliente
      const formattedResults = results.rows.map(row => ({
        id: row.id,
        validationId: row.validation_id,
        parameter: row.parameter,
        result: row.result,
        status: row.status,
        createdBy: row.created_by,
        createdByName: row.created_by_name,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      
      res.status(200).json(formattedResults);
    } catch (error) {
      console.error('Erro ao buscar resultados de validação:', error);
      res.status(500).json({ message: "Erro ao buscar resultados de validação" });
    }
  });
  
  app.post('/api/laboratory/hplc/validations/:id/results', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const validationId = parseInt(req.params.id);
      const laboratoryId = await getLaboratoryId(req.session?.user?.id, req.session?.user?.role);
      const userId = req.session?.user?.id;
      
      const { parameter, result, status } = req.body;
      
      // Validar dados
      if (!parameter || !result || !status) {
        return res.status(400).json({ message: "Dados incompletos" });
      }
      
      // Verificar se a validação existe e pertence ao laboratório
      const checkValidation = await pool.query(
        'SELECT id FROM hplc_validations WHERE id = $1 AND ($2::int IS NULL OR laboratory_id = $2)',
        [validationId, laboratoryId]
      );
      
      if (checkValidation.rows.length === 0) {
        return res.status(404).json({ message: "Validação não encontrada" });
      }
      
      // Verificar se já existe um resultado para este parâmetro
      const existingResult = await pool.query(
        'SELECT id FROM hplc_validation_results WHERE validation_id = $1 AND parameter = $2',
        [validationId, parameter]
      );
      
      if (existingResult.rows.length > 0) {
        return res.status(400).json({ message: "Já existe um resultado registrado para este parâmetro" });
      }
      
      // Inserir resultado
      const insertResult = await pool.query(
        `INSERT INTO hplc_validation_results (
          validation_id, parameter, result, status, created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id`,
        [validationId, parameter, result, status, userId]
      );
      
      // Atualizar o progresso da validação
      await updateValidationProgress(validationId);
      
      res.status(201).json({
        id: insertResult.rows[0].id,
        message: "Resultado adicionado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao adicionar resultado:', error);
      res.status(500).json({ message: "Erro ao adicionar resultado" });
    }
  });
  
  app.delete('/api/laboratory/hplc/validation-results/:id', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const resultId = parseInt(req.params.id);
      const laboratoryId = await getLaboratoryId(req.session?.user?.id, req.session?.user?.role);
      
      // Buscar o resultado e verificar se pertence a uma validação do laboratório
      const checkResult = await pool.query(
        `SELECT r.id, r.validation_id 
        FROM hplc_validation_results r
        JOIN hplc_validations v ON r.validation_id = v.id
        WHERE r.id = $1 AND ($2::int IS NULL OR v.laboratory_id = $2)`,
        [resultId, laboratoryId]
      );
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: "Resultado não encontrado" });
      }
      
      const validationId = checkResult.rows[0].validation_id;
      
      // Excluir o resultado
      await pool.query(
        'DELETE FROM hplc_validation_results WHERE id = $1',
        [resultId]
      );
      
      // Atualizar o progresso da validação
      await updateValidationProgress(validationId);
      
      res.status(200).json({ message: "Resultado excluído com sucesso" });
    } catch (error) {
      console.error('Erro ao excluir resultado:', error);
      res.status(500).json({ message: "Erro ao excluir resultado" });
    }
  });
  
  // Documentos de validação
  app.get('/api/laboratory/hplc/validations/:id/documents', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const validationId = parseInt(req.params.id);
      const laboratoryId = await getLaboratoryId(req.session?.user?.id, req.session?.user?.role);
      
      // Verificar se a validação existe e pertence ao laboratório
      const checkValidation = await pool.query(
        'SELECT id FROM hplc_validations WHERE id = $1 AND ($2::int IS NULL OR laboratory_id = $2)',
        [validationId, laboratoryId]
      );
      
      if (checkValidation.rows.length === 0) {
        return res.status(404).json({ message: "Validação não encontrada" });
      }
      
      // Buscar documentos
      const documents = await pool.query(
        `SELECT d.*, u.name as uploaded_by_name
        FROM hplc_validation_documents d
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE d.validation_id = $1
        ORDER BY d.uploaded_at DESC`,
        [validationId]
      );
      
      // Formatar dados para o cliente
      const formattedDocuments = documents.rows.map(row => ({
        id: row.id,
        validationId: row.validation_id,
        name: row.name,
        description: row.description,
        fileType: row.file_type,
        fileSize: row.file_size,
        filePath: row.file_path,
        uploadedBy: row.uploaded_by,
        uploadedByName: row.uploaded_by_name,
        uploadedAt: row.uploaded_at
      }));
      
      res.status(200).json(formattedDocuments);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      res.status(500).json({ message: "Erro ao buscar documentos" });
    }
  });
  
  app.post('/api/laboratory/hplc/validations/:id/documents', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const validationId = parseInt(req.params.id);
      const laboratoryId = await getLaboratoryId(req.session?.user?.id, req.session?.user?.role);
      const userId = req.session?.user?.id;
      
      // Processar o documento enviado (requer configuração de multer ou similar para upload)
      const { name, description } = req.body;
      const file = req.file;
      
      if (!name || !file) {
        return res.status(400).json({ message: "Dados incompletos" });
      }
      
      // Verificar se a validação existe e pertence ao laboratório
      const checkValidation = await pool.query(
        'SELECT id FROM hplc_validations WHERE id = $1 AND ($2::int IS NULL OR laboratory_id = $2)',
        [validationId, laboratoryId]
      );
      
      if (checkValidation.rows.length === 0) {
        return res.status(404).json({ message: "Validação não encontrada" });
      }
      
      // Inserir documento
      const result = await pool.query(
        `INSERT INTO hplc_validation_documents (
          validation_id, name, description, file_type, file_size, file_path, 
          uploaded_by, uploaded_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING id`,
        [
          validationId, 
          name, 
          description || null, 
          file.mimetype, 
          file.size, 
          file.path,
          userId
        ]
      );
      
      res.status(201).json({
        id: result.rows[0].id,
        message: "Documento adicionado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao adicionar documento:', error);
      res.status(500).json({ message: "Erro ao adicionar documento" });
    }
  });
  
  app.delete('/api/laboratory/hplc/documents/:id', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      const laboratoryId = await getLaboratoryId(req.session?.user?.id, req.session?.user?.role);
      
      // Buscar o documento e verificar se pertence a uma validação do laboratório
      const checkDocument = await pool.query(
        `SELECT d.id, d.file_path
        FROM hplc_validation_documents d
        JOIN hplc_validations v ON d.validation_id = v.id
        WHERE d.id = $1 AND ($2::int IS NULL OR v.laboratory_id = $2)`,
        [documentId, laboratoryId]
      );
      
      if (checkDocument.rows.length === 0) {
        return res.status(404).json({ message: "Documento não encontrado" });
      }
      
      // Remover o arquivo físico (se necessário)
      // const filePath = checkDocument.rows[0].file_path;
      // fs.unlinkSync(filePath);
      
      // Excluir o registro do documento
      await pool.query(
        'DELETE FROM hplc_validation_documents WHERE id = $1',
        [documentId]
      );
      
      res.status(200).json({ message: "Documento excluído com sucesso" });
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      res.status(500).json({ message: "Erro ao excluir documento" });
    }
  });
  
  // API para buscar usuários do laboratório (para preencher responsáveis)
  app.get('/api/laboratory/users', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const laboratoryId = await getLaboratoryId(req.session?.user?.id, req.session?.user?.role);
      
      // Se for admin, mostrar todos os usuários de laboratório do sistema
      const query = req.session?.user?.role === 'admin' 
        ? `SELECT id, name FROM users WHERE (role = 'laboratory' OR role = 'employee') AND active = true ORDER BY name`
        : `SELECT id, name FROM users WHERE organization_id = $1 AND (role = 'laboratory' OR role = 'employee') AND active = true ORDER BY name`;
      
      const users = await pool.query(
        query,
        req.session?.user?.role === 'admin' ? [] : [laboratoryId]
      );
      
      res.status(200).json(users.rows);
    } catch (error) {
      console.error('Erro ao buscar usuários do laboratório:', error);
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  });
  
  // Função para atualizar o progresso de uma validação com base nos resultados
  async function updateValidationProgress(validationId: number) {
    try {
      // Buscar a validação
      const validation = await pool.query(
        'SELECT validation_parameters FROM hplc_validations WHERE id = $1',
        [validationId]
      );
      
      if (validation.rows.length === 0) return;
      
      const parameters = validation.rows[0].validation_parameters;
      
      // Buscar resultados existentes
      const results = await pool.query(
        'SELECT parameter FROM hplc_validation_results WHERE validation_id = $1',
        [validationId]
      );
      
      // Calcular o progresso
      const totalParameters = parameters.length;
      const completedParameters = results.rows.length;
      let progress = 0;
      
      if (totalParameters > 0) {
        progress = Math.round((completedParameters / totalParameters) * 100);
      }
      
      // Atualizar o progresso na validação
      await pool.query(
        'UPDATE hplc_validations SET progress = $1, updated_at = NOW() WHERE id = $2',
        [progress, validationId]
      );
    } catch (error) {
      console.error('Erro ao atualizar progresso da validação:', error);
    }
  }

  console.log("Rotas de validação HPLC registradas");
}