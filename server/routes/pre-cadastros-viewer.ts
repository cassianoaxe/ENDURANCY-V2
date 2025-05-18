import express from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import path from 'path';

const router = express.Router();

// Rota para página HTML com visualização direta
router.get('/view', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pre-cadastros-view.html'));
});

// Rota para buscar dados dos pré-cadastros
router.get('/data', async (req, res) => {
  try {
    // Consulta no banco de dados
    const result = await db.execute(sql`SELECT COUNT(*) as total FROM pre_cadastros`);
    
    // Buscar todos os pré-cadastros para a administração
    const entries = await db.execute(sql`
      SELECT 
        id, nome, email, organizacao, tipo_organizacao, telefone, cargo, 
        interesse, comentarios, modulos, aceita_termos, status, observacoes, 
        ip, user_agent, created_at, contatado_em, convertido_em
      FROM pre_cadastros 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      message: "Consulta de pré-cadastros bem-sucedida",
      timestamp: new Date().toISOString(),
      count: result,
      entries: entries,
    });
  } catch (error) {
    console.error('Erro ao consultar pré-cadastros:', error);
    res.status(500).json({
      success: false,
      message: "Erro ao consultar pré-cadastros",
      error: String(error)
    });
  }
});

export default router;