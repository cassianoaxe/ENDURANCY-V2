import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { sql } from 'drizzle-orm';
import * as schema from './shared/schema';
import * as suppliersSchema from './shared/schema-suppliers';
import ws from 'ws';

// Configure WebSocket para o NeonDB
neonConfig.webSocketConstructor = ws;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log('Pushing schema to database...');
  
  try {
    // Criar os enums do esquema de fornecedores
    await pool.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'supplier_status') THEN
              CREATE TYPE supplier_status AS ENUM ('pending', 'active', 'suspended', 'inactive');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
              CREATE TYPE product_status AS ENUM ('draft', 'active', 'out_of_stock', 'discontinued');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
              CREATE TYPE order_status AS ENUM ('draft', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tender_type') THEN
              CREATE TYPE tender_type AS ENUM ('open', 'selective', 'direct');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proposal_status') THEN
              CREATE TYPE proposal_status AS ENUM ('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'cancelled');
          END IF;
      END
      $$;
    `);
    
    console.log('Enums criados com sucesso!');
    
    // Criar a tabela de fornecedores
    await pool.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        trading_name TEXT,
        cnpj TEXT NOT NULL UNIQUE,
        state_registration TEXT,
        email TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        contact_name TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        website TEXT,
        logo TEXT,
        status supplier_status DEFAULT 'pending',
        verified BOOLEAN DEFAULT FALSE,
        description TEXT,
        social_media JSONB,
        bank_info JSONB,
        documentation_completed BOOLEAN DEFAULT FALSE,
        rating DECIMAL(3, 2),
        rating_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER
      );
    `);
    
    console.log('Tabela de fornecedores criada com sucesso!');
    
    // Criar a tabela de produtos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
        name TEXT NOT NULL,
        sku TEXT,
        barcode TEXT,
        description TEXT,
        short_description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        compare_at_price DECIMAL(10, 2),
        cost_price DECIMAL(10, 2),
        tax_rate DECIMAL(5, 2) DEFAULT '0',
        weight DECIMAL(8, 3),
        weight_unit TEXT DEFAULT 'g',
        dimensions JSONB,
        inventory INTEGER DEFAULT 0,
        low_inventory_threshold INTEGER DEFAULT 5,
        status product_status DEFAULT 'draft',
        is_featured BOOLEAN DEFAULT FALSE,
        is_virtual BOOLEAN DEFAULT FALSE,
        requires_prescription BOOLEAN DEFAULT FALSE,
        tags TEXT[],
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER
      );
    `);
    
    console.log('Tabela de produtos criada com sucesso!');
    
    // Criar a tabela de categorias de produto
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        parent_id INTEGER REFERENCES product_categories(id),
        image_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        position INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER
      );
    `);
    
    console.log('Tabela de categorias de produto criada com sucesso!');
    
    // Criar a tabela de link produto-categoria
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_category_links (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id),
        category_id INTEGER NOT NULL REFERENCES product_categories(id),
        created_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT product_category_unique UNIQUE (product_id, category_id)
      );
    `);
    
    console.log('Tabela de links produto-categoria criada com sucesso!');
    
    console.log('Push de schema concluído com sucesso!');
  } catch (error) {
    console.error('Erro ao fazer push do schema:', error);
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});