import { db } from './db';
import { formatDate } from './utils';
import { pool } from './db';

/**
 * Função para criar dados de exemplo de treinamentos para o módulo HPLC
 */
export async function seedHplcTrainings() {
  try {
    // Verificar se já existem treinamentos no sistema
    const checkQuery = `SELECT COUNT(*) FROM hplc_user_trainings`;
    const existingTrainings = await pool.query(checkQuery);
    
    const trainingCount = parseInt(existingTrainings.rows[0].count);
    
    if (trainingCount > 0) {
      console.log(`[HPLC Trainings] ${trainingCount} treinamentos já existem no banco de dados, pulando criação de dados de exemplo.`);
      return;
    }
    
    console.log("[HPLC Trainings] Inicializando dados de exemplo para treinamentos HPLC...");
    
    // Obter laboratórios para associar treinamentos
    const laboratoriesQuery = `
      SELECT id, name FROM organizations 
      WHERE type = 'laboratory' 
      LIMIT 2
    `;
    const laboratories = await pool.query(laboratoriesQuery);
    
    if (laboratories.rows.length === 0) {
      console.log("[HPLC Trainings] Nenhum laboratório encontrado para associar treinamentos.");
      
      // Criar um laboratório de exemplo se não existir nenhum
      const createLabQuery = `
        INSERT INTO organizations (name, type, status, created_at, updated_at)
        VALUES ('Laboratório de Análises Clínicas', 'laboratory', 'active', NOW(), NOW())
        RETURNING id, name
      `;
      const newLab = await pool.query(createLabQuery);
      laboratories.rows.push(newLab.rows[0]);
      
      console.log(`[HPLC Trainings] Laboratório criado: ${newLab.rows[0].name} (ID: ${newLab.rows[0].id})`);
    }
    
    // Para cada laboratório, criar funcionários e treinamentos
    for (const laboratory of laboratories.rows) {
      const labId = laboratory.id;
      const labName = laboratory.name;
      
      console.log(`[HPLC Trainings] Processando laboratório: ${labName} (ID: ${labId})`);
      
      // Verificar se existem usuários para este laboratório
      const usersQuery = `
        SELECT id, name, email FROM users 
        WHERE organization_id = $1
        LIMIT 5
      `;
      const usersResult = await pool.query(usersQuery, [labId]);
      
      let users = usersResult.rows;
      
      // Se não existirem usuários, criar alguns
      if (users.length < 3) {
        const usersToCreate = [
          { name: 'Ana Paula Técnica', email: 'ana@lab.com', role: 'employee' },
          { name: 'Bruno Santos', email: 'bruno@lab.com', role: 'employee' },
          { name: 'Carlos Eduardo', email: 'carlos@lab.com', role: 'employee' },
          { name: 'Daniela Oliveira', email: 'daniela@lab.com', role: 'manager' },
          { name: 'Eduardo Martins', email: 'eduardo@lab.com', role: 'laboratory' }
        ];
        
        for (const user of usersToCreate) {
          // Verificar se o usuário já existe pelo email
          const existingUserQuery = `
            SELECT id FROM users WHERE email = $1
          `;
          const existingUser = await pool.query(existingUserQuery, [user.email]);
          
          if (existingUser.rows.length === 0) {
            // Criar usuário
            const createUserQuery = `
              INSERT INTO users (name, email, username, password_hash, role, organization_id, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
              RETURNING id, name, email
            `;
            
            const username = user.email.split('@')[0];
            const passwordHash = '$2b$10$VHqP2JZPD5FZpCCzXEwJxOe.19q2HzDCNX2jL1KPpFRFDnB5RRJhm'; // senha: 123456
            
            const newUser = await pool.query(createUserQuery, [
              user.name,
              user.email,
              username,
              passwordHash,
              user.role,
              labId
            ]);
            
            users.push(newUser.rows[0]);
            console.log(`[HPLC Trainings] Usuário criado: ${user.name} (${user.email})`);
          }
        }
      }
      
      // Verificar se existem equipamentos para este laboratório
      const equipmentsQuery = `
        SELECT id, name, model FROM hplc_equipments 
        WHERE laboratory_id = $1
        LIMIT 3
      `;
      const equipmentsResult = await pool.query(equipmentsQuery, [labId]);
      
      let equipments = equipmentsResult.rows;
      
      // Se não existirem equipamentos, criar alguns
      if (equipments.length === 0) {
        const equipmentsToCreate = [
          { name: 'HPLC Agilent 1260', model: 'Infinity II', serial_number: 'AG12345', manufacturer: 'Agilent' },
          { name: 'HPLC Waters', model: 'Alliance e2695', serial_number: 'WAT67890', manufacturer: 'Waters' },
          { name: 'HPLC Shimadzu', model: 'LC-2030', serial_number: 'SHM54321', manufacturer: 'Shimadzu' }
        ];
        
        for (const equipment of equipmentsToCreate) {
          const createEquipmentQuery = `
            INSERT INTO hplc_equipments (
              name, model, serial_number, manufacturer, status, 
              laboratory_id, created_by, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING id, name, model
          `;
          
          const newEquipment = await pool.query(createEquipmentQuery, [
            equipment.name,
            equipment.model,
            equipment.serial_number,
            equipment.manufacturer,
            'operational',
            labId,
            users[0].id // Primeiro usuário como criador
          ]);
          
          equipments.push(newEquipment.rows[0]);
          console.log(`[HPLC Trainings] Equipamento criado: ${equipment.name} (${equipment.model})`);
        }
      }
      
      // Verificar se existem procedimentos para este laboratório
      const proceduresQuery = `
        SELECT id, title, document_number FROM hplc_procedures 
        WHERE laboratory_id = $1
        LIMIT 3
      `;
      const proceduresResult = await pool.query(proceduresQuery, [labId]);
      
      let procedures = proceduresResult.rows;
      
      // Se não existirem procedimentos, criar alguns
      if (procedures.length === 0) {
        const proceduresToCreate = [
          { title: 'POP - Operação do HPLC', document_number: 'POP-HPLC-001', version: '1.0' },
          { title: 'POP - Manutenção Preventiva', document_number: 'POP-HPLC-002', version: '1.0' },
          { title: 'POP - Análise de Cannabinoides', document_number: 'POP-HPLC-003', version: '1.0' }
        ];
        
        for (const procedure of proceduresToCreate) {
          const createProcedureQuery = `
            INSERT INTO hplc_procedures (
              title, document_number, version, content, 
              laboratory_id, created_by, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING id, title, document_number
          `;
          
          const newProcedure = await pool.query(createProcedureQuery, [
            procedure.title,
            procedure.document_number,
            procedure.version,
            'Conteúdo do procedimento operacional padrão',
            labId,
            users[0].id // Primeiro usuário como criador
          ]);
          
          procedures.push(newProcedure.rows[0]);
          console.log(`[HPLC Trainings] Procedimento criado: ${procedure.title} (${procedure.document_number})`);
        }
      }
      
      // Agora criar treinamentos
      const trainingsToCreate = [
        {
          title: 'Treinamento Inicial HPLC Agilent',
          type: 'initial',
          user_id: users[0].id,
          trained_by: users[3].id,
          equipment_id: equipments[0].id,
          procedure_id: procedures[0].id,
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
          completion_date: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), // 29 dias atrás
          status: 'completed',
          score: 95
        },
        {
          title: 'Treinamento em Manutenção Preventiva',
          type: 'refresher',
          user_id: users[1].id,
          trained_by: users[3].id,
          equipment_id: equipments[1].id,
          procedure_id: procedures[1].id,
          start_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 dias atrás
          completion_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 dias atrás
          status: 'completed',
          score: 88
        },
        {
          title: 'Treinamento em Análise de Cannabinoides',
          type: 'qualification',
          user_id: users[2].id,
          trained_by: users[3].id,
          equipment_id: equipments[2].id,
          procedure_id: procedures[2].id,
          start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
          completion_date: null,
          status: 'in_progress',
          score: null
        },
        {
          title: 'Qualificação em Operação Padrão',
          type: 'qualification',
          user_id: users[0].id,
          trained_by: users[3].id,
          equipment_id: equipments[0].id,
          procedure_id: procedures[0].id,
          start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
          completion_date: null,
          status: 'pending',
          score: null
        },
        {
          title: 'Atualização de Procedimentos',
          type: 'refresher',
          user_id: users[1].id,
          trained_by: users[3].id,
          equipment_id: null,
          procedure_id: procedures[1].id,
          start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
          completion_date: null,
          status: 'pending',
          score: null
        }
      ];
      
      for (const training of trainingsToCreate) {
        const createTrainingQuery = `
          INSERT INTO hplc_user_trainings (
            training_title, training_type, user_id, trained_by,
            equipment_id, procedure_id, start_date, completion_date,
            status, assessment_score, comments, created_by, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
          RETURNING id
        `;
        
        const newTraining = await pool.query(createTrainingQuery, [
          training.title,
          training.type,
          training.user_id,
          training.trained_by,
          training.equipment_id,
          training.procedure_id,
          training.start_date,
          training.completion_date,
          training.status,
          training.score,
          'Comentários sobre o treinamento e desempenho do funcionário.',
          training.trained_by // Treinador como criador do registro
        ]);
        
        console.log(`[HPLC Trainings] Treinamento criado: ${training.title} (ID: ${newTraining.rows[0].id})`);
      }
    }
    
    console.log('[HPLC Trainings] Dados de treinamentos inicializados com sucesso!');
    
  } catch (error) {
    console.error('[HPLC Trainings] Erro ao criar dados de exemplo:', error);
  }
}