import { Express, Request, Response } from 'express';
import { pool } from '../db';
import { authenticate } from '../routes';

// Essa é uma cópia das rotas de treinamento HPLC mas com um caminho diferente
// para evitar conflitos com o middleware do Vite

// Middleware para verificar acesso ao módulo HPLC
const checkHplcAccess = async (req: Request, res: Response, next: Function) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Não autenticado" });
  }
  
  if (req.session.user.role !== 'laboratory' && req.session.user.role !== 'admin' && req.session.user.role !== 'employee') {
    return res.status(403).json({ message: "Acesso não autorizado ao módulo HPLC" });
  }
  next();
};

export async function registerTrainerRoutes(app: Express) {
  // GET all trainings
  app.get('/api/trainer', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const { status, search } = req.query;
      const laboratoryId = req.session.user?.organizationId;

      if (!laboratoryId) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }

      let query = `
        SELECT 
          t.*,
          u1.name as user_name,
          u1.email as user_email,
          u2.name as trained_by_name,
          e.name as equipment_name,
          e.model as equipment_model,
          p.title as procedure_title
        FROM hplc_user_trainings t
        LEFT JOIN users u1 ON t.user_id = u1.id
        LEFT JOIN users u2 ON t.trained_by = u2.id
        LEFT JOIN hplc_equipments e ON t.equipment_id = e.id
        LEFT JOIN hplc_procedures p ON t.procedure_id = p.id
        WHERE u1.organization_id = $1
      `;

      const queryParams: any[] = [laboratoryId];
      let paramCounter = 2;

      if (status && status !== 'all') {
        query += ` AND t.status = $${paramCounter}`;
        queryParams.push(status);
        paramCounter++;
      }

      if (search) {
        query += ` AND (
          t.training_title ILIKE $${paramCounter} OR
          u1.name ILIKE $${paramCounter} OR
          u1.email ILIKE $${paramCounter} OR
          u2.name ILIKE $${paramCounter} OR
          e.name ILIKE $${paramCounter} OR
          p.title ILIKE $${paramCounter}
        )`;
        queryParams.push(`%${search}%`);
        paramCounter++;
      }

      // Order by most recent first
      query += ` ORDER BY t.created_at DESC`;

      const result = await pool.query(query, queryParams);
      
      // Convert snake_case to camelCase for frontend
      const trainings = result.rows.map((row: any) => ({
        id: row.id,
        trainingTitle: row.training_title,
        trainingType: row.training_type,
        userId: row.user_id,
        user_name: row.user_name,
        user_email: row.user_email,
        trainedBy: row.trained_by,
        trained_by_name: row.trained_by_name,
        procedureId: row.procedure_id,
        procedure_title: row.procedure_title,
        equipmentId: row.equipment_id,
        equipment_name: row.equipment_name,
        equipment_model: row.equipment_model,
        startDate: row.start_date,
        completionDate: row.completion_date,
        status: row.status,
        evaluationScore: row.assessment_score,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      res.json(trainings);
    } catch (error) {
      console.error('Error fetching trainings:', error);
      res.status(500).json({ error: 'Erro ao buscar treinamentos' });
    }
  });

  // GET training by ID
  app.get('/api/trainer/detail/:id', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const laboratoryId = req.session.user?.organizationId;

      if (!laboratoryId) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }

      const query = `
        SELECT 
          t.*,
          u1.name as user_name,
          u1.email as user_email,
          u2.name as trained_by_name,
          e.name as equipment_name,
          e.model as equipment_model,
          p.title as procedure_title
        FROM hplc_user_trainings t
        LEFT JOIN users u1 ON t.user_id = u1.id
        LEFT JOIN users u2 ON t.trained_by = u2.id
        LEFT JOIN hplc_equipments e ON t.equipment_id = e.id
        LEFT JOIN hplc_procedures p ON t.procedure_id = p.id
        WHERE t.id = $1 AND u1.organization_id = $2
      `;

      const result = await pool.query(query, [parseInt(id), laboratoryId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Treinamento não encontrado' });
      }

      const row = result.rows[0];
      const training = {
        id: row.id,
        trainingTitle: row.training_title,
        trainingType: row.training_type,
        userId: row.user_id,
        user_name: row.user_name,
        user_email: row.user_email,
        trainedBy: row.trained_by,
        trained_by_name: row.trained_by_name,
        procedureId: row.procedure_id,
        procedure_title: row.procedure_title,
        equipmentId: row.equipment_id,
        equipment_name: row.equipment_name,
        equipment_model: row.equipment_model,
        startDate: row.start_date,
        completionDate: row.completion_date,
        status: row.status,
        evaluationScore: row.assessment_score,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };

      res.json(training);
    } catch (error) {
      console.error('Error fetching training:', error);
      res.status(500).json({ error: 'Erro ao buscar treinamento' });
    }
  });

  // POST create a new training
  app.post('/api/trainer/create', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const {
        trainingTitle,
        trainingType,
        userId,
        trainedBy,
        procedureId,
        equipmentId,
        startDate,
        completionDate,
        status,
        evaluationScore,
        notes
      } = req.body;

      const createdBy = req.session.user?.id;

      if (!createdBy) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }

      const query = `
        INSERT INTO hplc_user_trainings (
          training_title, 
          training_type,
          user_id,
          trained_by,
          procedure_id,
          equipment_id,
          start_date,
          completion_date,
          status,
          assessment_score,
          notes,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const values = [
        trainingTitle,
        trainingType,
        userId,
        trainedBy,
        procedureId || null,
        equipmentId || null,
        startDate,
        completionDate || null,
        status,
        evaluationScore || null,
        notes || null,
        createdBy
      ];

      const result = await pool.query(query, values);
      const row = result.rows[0];

      const training = {
        id: row.id,
        trainingTitle: row.training_title,
        trainingType: row.training_type,
        userId: row.user_id,
        trainedBy: row.trained_by,
        procedureId: row.procedure_id,
        equipmentId: row.equipment_id,
        startDate: row.start_date,
        completionDate: row.completion_date,
        status: row.status,
        evaluationScore: row.assessment_score,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };

      res.status(201).json(training);
    } catch (error) {
      console.error('Error creating training:', error);
      res.status(500).json({ error: 'Erro ao criar treinamento' });
    }
  });

  // PUT update a training by ID
  app.put('/api/trainer/update/:id', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        trainingTitle,
        trainingType,
        userId,
        trainedBy,
        procedureId,
        equipmentId,
        startDate,
        completionDate,
        status,
        evaluationScore,
        notes
      } = req.body;

      const laboratoryId = req.session.user?.organizationId;

      if (!laboratoryId) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }

      // Verify the training belongs to this laboratory
      const checkQuery = `
        SELECT t.* FROM hplc_user_trainings t
        JOIN users u ON t.user_id = u.id
        WHERE t.id = $1 AND u.organization_id = $2
      `;
      const checkResult = await pool.query(checkQuery, [id, laboratoryId]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Treinamento não encontrado' });
      }

      const query = `
        UPDATE hplc_user_trainings SET
          training_title = $1,
          training_type = $2,
          user_id = $3,
          trained_by = $4,
          procedure_id = $5,
          equipment_id = $6,
          start_date = $7,
          completion_date = $8,
          status = $9,
          assessment_score = $10,
          notes = $11,
          updated_at = NOW()
        WHERE id = $12
        RETURNING *
      `;

      const values = [
        trainingTitle,
        trainingType,
        userId,
        trainedBy,
        procedureId || null,
        equipmentId || null,
        startDate,
        completionDate || null,
        status,
        evaluationScore || null,
        notes || null,
        id
      ];

      const result = await pool.query(query, values);
      const row = result.rows[0];

      const training = {
        id: row.id,
        trainingTitle: row.training_title,
        trainingType: row.training_type,
        userId: row.user_id,
        trainedBy: row.trained_by,
        procedureId: row.procedure_id,
        equipmentId: row.equipment_id,
        startDate: row.start_date,
        completionDate: row.completion_date,
        status: row.status,
        evaluationScore: row.assessment_score,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };

      res.json(training);
    } catch (error) {
      console.error('Error updating training:', error);
      res.status(500).json({ error: 'Erro ao atualizar treinamento' });
    }
  });

  // DELETE a training by ID
  app.delete('/api/trainer/delete/:id', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const laboratoryId = req.session.user?.organizationId;

      if (!laboratoryId) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }

      // Verify the training belongs to this laboratory
      const checkQuery = `
        SELECT t.* FROM hplc_user_trainings t
        JOIN users u ON t.user_id = u.id
        WHERE t.id = $1 AND u.organization_id = $2
      `;
      const checkResult = await pool.query(checkQuery, [id, laboratoryId]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Treinamento não encontrado' });
      }

      const query = `
        DELETE FROM hplc_user_trainings
        WHERE id = $1
        RETURNING id
      `;

      await pool.query(query, [id]);

      res.json({ success: true, message: 'Treinamento excluído com sucesso' });
    } catch (error) {
      console.error('Error deleting training:', error);
      res.status(500).json({ error: 'Erro ao excluir treinamento' });
    }
  });

  // GET users available for training
  app.get('/api/trainer/users', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const laboratoryId = req.session.user?.organizationId;

      if (!laboratoryId) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }

      // Get users from organization (laboratory)
      const query = `
        SELECT id, name, email, role 
        FROM users 
        WHERE organization_id = $1
      `;

      const result = await pool.query(query, [laboratoryId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching training users:', error);
      res.status(500).json({ error: 'Erro ao buscar usuários para treinamento' });
    }
  });

  // GET procedures available for training
  app.get('/api/trainer/procedures', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const laboratoryId = req.session.user?.organizationId;

      if (!laboratoryId) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }

      const query = `
        SELECT id, title, document_number, version, category 
        FROM hplc_procedures 
        WHERE laboratory_id = $1
        ORDER BY title
      `;

      const result = await pool.query(query, [laboratoryId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching training procedures:', error);
      res.status(500).json({ error: 'Erro ao buscar procedimentos para treinamento' });
    }
  });

  // GET equipments available for training
  app.get('/api/trainer/equipments', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const laboratoryId = req.session.user?.organizationId;

      if (!laboratoryId) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }

      const query = `
        SELECT id, name, model, serial_number, manufacturer 
        FROM hplc_equipments 
        WHERE laboratory_id = $1
        ORDER BY name
      `;

      const result = await pool.query(query, [laboratoryId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching training equipments:', error);
      res.status(500).json({ error: 'Erro ao buscar equipamentos para treinamento' });
    }
  });

  console.log('Rotas de treinamento HPLC alternativas registradas com sucesso');
}