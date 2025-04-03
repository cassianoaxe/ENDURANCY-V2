// Arquivo temporário para teste de API
const express = require('express');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/test-plan-requests', async (req, res) => {
  try {
    console.log("Executando rota de teste independente");
    
    // Buscar organizações com solicitações de mudança de plano
    const query = `
      SELECT 
        o.id, 
        o.name, 
        o.type, 
        o.email, 
        o.status, 
        o.plan_id as "currentPlanId", 
        o.requested_plan_id as "requestedPlanId", 
        o.updated_at as "requestDate",
        COALESCE(cp.name, 'Sem plano') as "currentPlanName",
        COALESCE(rp.name, 'Plano não encontrado') as "requestedPlanName"
      FROM organizations o
      LEFT JOIN plans cp ON o.plan_id = cp.id
      LEFT JOIN plans rp ON o.requested_plan_id = rp.id
      WHERE o.status = 'pending_plan_change'
    `;
    
    const result = await pool.query(query);
    console.log("Resultado bruto:", result.rows);
    
    // Formatação especial para depuração
    const requests = result.rows.map(req => ({
      id: req.id,
      name: req.name || 'Nome não encontrado',
      type: req.type || 'Tipo não especificado',
      email: req.email || 'Email não especificado',
      status: 'pending_plan_change',
      currentPlanId: req.currentPlanId || null,
      requestedPlanId: req.requestedPlanId || null,
      requestDate: req.requestDate || new Date(),
      currentPlanName: req.currentPlanName || 'Plano não especificado',
      requestedPlanName: req.requestedPlanName || 'Plano não especificado'
    }));
    
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      success: true,
      totalRequests: requests.length,
      requests: requests,
      message: "API de teste - Sem autenticação"
    });
  } catch (error) {
    console.error("Erro no teste:", error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ 
      success: false, 
      message: "Falha no teste" 
    });
  }
});

// Este módulo está pronto para uso
console.log("Módulo de teste carregado");

module.exports = app;