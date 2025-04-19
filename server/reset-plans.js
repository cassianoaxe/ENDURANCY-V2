// Script para resetar os planos no banco de dados
require('dotenv').config();
const { db } = require('./db');
const { sql } = require('drizzle-orm');
const { initializePlans } = require('./payment');

async function resetPlans() {
  try {
    console.log('Removendo planos existentes...');
    await db.execute(sql`DELETE FROM plans`);
    console.log('Planos removidos com sucesso');
    
    console.log('Criando novos planos...');
    await initializePlans();
    console.log('Processo concluído!');
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao resetar planos:', error);
    process.exit(1);
  }
}

resetPlans();