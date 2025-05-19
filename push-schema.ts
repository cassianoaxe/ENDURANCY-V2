import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { sql } from 'drizzle-orm';
import * as schema from './shared/schema';
import * as suppliersSchema from './shared/schema-suppliers';
import * as socialSchema from './shared/schema-social';
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
    
    // Criar os enums do esquema social
    await pool.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'beneficiary_status') THEN
              CREATE TYPE beneficiary_status AS ENUM ('active', 'inactive', 'pending', 'rejected');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exemption_type') THEN
              CREATE TYPE exemption_type AS ENUM ('exemption_25', 'exemption_50', 'exemption_75', 'exemption_100');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_type') THEN
              CREATE TYPE membership_type AS ENUM ('regular', 'premium', 'lifetime', 'temporary');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_card_status') THEN
              CREATE TYPE membership_card_status AS ENUM ('pending', 'approved', 'printed', 'delivered', 'expired', 'cancelled');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_card_type') THEN
              CREATE TYPE membership_card_type AS ENUM ('digital', 'physical', 'both');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_category') THEN
              CREATE TYPE partner_category AS ENUM ('health', 'pharmacy', 'food', 'education', 'services', 'retail', 'other');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_status') THEN
              CREATE TYPE partner_status AS ENUM ('active', 'inactive', 'pending');
          END IF;
      END
      $$;
    `);
    
    console.log('Enums do módulo social criados com sucesso!');
    
    // Criar a tabela de beneficiários sociais
    await pool.query(`
      CREATE TABLE IF NOT EXISTS social_beneficiaries (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        rg TEXT,
        birth_date DATE NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        address_number TEXT,
        address_complement TEXT,
        neighborhood TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zip_code TEXT NOT NULL,
        status beneficiary_status NOT NULL DEFAULT 'pending',
        membership_type membership_type,
        membership_start_date DATE,
        membership_end_date DATE,
        membership_code TEXT,
        membership_rules JSONB,
        document_front TEXT,
        document_back TEXT,
        proof_of_income TEXT,
        proof_of_residence TEXT,
        medical_report TEXT,
        exemption_type exemption_type NOT NULL DEFAULT 'exemption_25',
        exemption_value DECIMAL(10, 2) NOT NULL DEFAULT '25',
        monthly_income DECIMAL(10, 2),
        family_members INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('Tabela de beneficiários sociais criada com sucesso!');
    
    // Criar a tabela de carteirinhas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS social_membership_cards (
        id SERIAL PRIMARY KEY,
        beneficiary_id INTEGER NOT NULL,
        organization_id INTEGER NOT NULL,
        card_type membership_card_type NOT NULL DEFAULT 'digital',
        status membership_card_status NOT NULL DEFAULT 'pending',
        card_number TEXT NOT NULL,
        qr_code_url TEXT,
        issue_date TIMESTAMP DEFAULT NOW(),
        expiry_date TIMESTAMP NOT NULL,
        pin TEXT,
        pin_setup_completed BOOLEAN DEFAULT FALSE,
        last_pin_change_date TIMESTAMP,
        photo_url TEXT,
        card_image_url TEXT,
        printed_at TIMESTAMP,
        delivered_at TIMESTAMP,
        physical_card_requested BOOLEAN DEFAULT FALSE,
        physical_card_payment_status TEXT DEFAULT 'pending',
        physical_card_payment_id TEXT,
        physical_card_payment_amount DECIMAL(10, 2) DEFAULT '25.00',
        physical_card_tracking_number TEXT,
        physical_card_shipping_address TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('Tabela de carteirinhas criada com sucesso!');
    
    // Criar a tabela de configurações de carteirinha
    await pool.query(`
      CREATE TABLE IF NOT EXISTS social_membership_card_settings (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER NOT NULL UNIQUE,
        card_title_text TEXT DEFAULT 'Carteirinha de Associado',
        card_subtitle_text TEXT DEFAULT 'Associação de Pacientes',
        card_background_color TEXT DEFAULT '#FFFFFF',
        card_text_color TEXT DEFAULT '#000000',
        card_highlight_color TEXT DEFAULT '#00AA00',
        include_qr_code BOOLEAN DEFAULT TRUE,
        include_photo BOOLEAN DEFAULT TRUE,
        include_logo BOOLEAN DEFAULT TRUE,
        include_validity_date BOOLEAN DEFAULT TRUE,
        validity_period_months INTEGER DEFAULT 12,
        physical_card_price DECIMAL(10, 2) DEFAULT '25.00',
        physical_card_enabled BOOLEAN DEFAULT TRUE,
        pin_enabled BOOLEAN DEFAULT TRUE,
        pin_digits INTEGER DEFAULT 6,
        pin_require_letters BOOLEAN DEFAULT FALSE,
        pin_require_special_chars BOOLEAN DEFAULT FALSE,
        terms_text TEXT DEFAULT 'Esta carteirinha é pessoal e intransferível. Em caso de perda ou roubo, comunique imediatamente.',
        card_template TEXT DEFAULT 'default',
        custom_css TEXT,
        custom_fields JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('Tabela de configurações de carteirinha criada com sucesso!');
    
    // Criar a tabela de logs de acesso às carteirinhas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS social_membership_card_access_logs (
        id SERIAL PRIMARY KEY,
        card_id INTEGER NOT NULL,
        organization_id INTEGER NOT NULL,
        access_date TIMESTAMP DEFAULT NOW(),
        access_ip TEXT,
        access_user_agent TEXT,
        access_method TEXT NOT NULL,
        pin_verified BOOLEAN DEFAULT FALSE,
        prescription_viewed BOOLEAN DEFAULT FALSE,
        medical_report_viewed BOOLEAN DEFAULT FALSE,
        location_lat TEXT,
        location_lng TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('Tabela de logs de acesso às carteirinhas criada com sucesso!');
    
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