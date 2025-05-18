import { db } from '../db';
import { preCadastros } from '../../shared/schema-pre-cadastro';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Iniciando migração: criação da tabela pre_cadastros');

  try {
    // Verifica se a tabela já existe
    const tablesResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'pre_cadastros'
      );
    `);
    
    const tableExists = tablesResult.rows[0].exists;
    
    if (tableExists) {
      console.log('Tabela pre_cadastros já existe, pulando criação');
      return;
    }

    // Criação da tabela através de SQL
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pre_cadastros (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        organizacao VARCHAR(255) NOT NULL,
        tipo_organizacao VARCHAR(100),
        telefone VARCHAR(50),
        cargo VARCHAR(100),
        interesse TEXT,
        comentarios TEXT,
        modulos JSONB DEFAULT '[]',
        aceita_termos BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'novo',
        observacoes TEXT,
        ip VARCHAR(50),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        contatado_em TIMESTAMP,
        convertido_em TIMESTAMP
      );
    `);

    console.log('Tabela pre_cadastros criada com sucesso!');
  } catch (error) {
    console.error('Erro durante a migração:', error);
    throw error;
  }
}

main()
  .then(() => {
    console.log('Migração concluída com sucesso');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Falha na migração:', error);
    process.exit(1);
  });