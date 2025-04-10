-- Criar enums para categorias de documentos se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_category') THEN
        CREATE TYPE document_category AS ENUM ('identity', 'medical', 'prescription', 'insurance', 'other');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status') THEN
        CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

-- Criar tabela de documentos de pacientes
CREATE TABLE IF NOT EXISTS patient_documents (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL,
  organization_id INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  category document_category NOT NULL,
  status document_status NOT NULL DEFAULT 'pending',
  upload_date TIMESTAMP NOT NULL DEFAULT NOW(),
  reviewed_by_id INTEGER,
  review_date TIMESTAMP,
  review_notes TEXT
);

-- Adicionar restrições de chave estrangeira
ALTER TABLE patient_documents
  ADD CONSTRAINT fk_patient_documents_patient
  FOREIGN KEY (patient_id)
  REFERENCES patients(id)
  ON DELETE CASCADE;

ALTER TABLE patient_documents
  ADD CONSTRAINT fk_patient_documents_organization
  FOREIGN KEY (organization_id)
  REFERENCES organizations(id)
  ON DELETE CASCADE;

ALTER TABLE patient_documents
  ADD CONSTRAINT fk_patient_documents_reviewer
  FOREIGN KEY (reviewed_by_id)
  REFERENCES users(id)
  ON DELETE SET NULL;