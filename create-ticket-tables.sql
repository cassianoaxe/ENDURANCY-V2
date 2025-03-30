-- Criar o enum para status de ticket
CREATE TYPE ticket_status AS ENUM ('novo', 'em_analise', 'em_desenvolvimento', 'aguardando_resposta', 'resolvido', 'fechado', 'cancelado');

-- Criar o enum para prioridade de ticket
CREATE TYPE ticket_priority AS ENUM ('baixa', 'media', 'alta', 'critica');

-- Criar o enum para categoria de ticket
CREATE TYPE ticket_category AS ENUM ('bug', 'melhoria', 'duvida', 'financeiro', 'acesso', 'seguranca', 'performance', 'outros');

-- Criar tabela de tickets
CREATE TABLE support_tickets (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'novo',
  priority ticket_priority NOT NULL DEFAULT 'media',
  category VARCHAR(50) NOT NULL,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  created_by_id INTEGER NOT NULL REFERENCES users(id),
  assigned_to_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP,
  closed_at TIMESTAMP
);

-- Criar tabela de comentários de tickets
CREATE TABLE ticket_comments (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Criar tabela de anexos de tickets
CREATE TABLE ticket_attachments (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Criar índices para melhorar performance
CREATE INDEX idx_tickets_organization ON support_tickets(organization_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_tickets_created_by ON support_tickets(created_by_id);
CREATE INDEX idx_tickets_assigned_to ON support_tickets(assigned_to_id);
CREATE INDEX idx_comments_ticket ON ticket_comments(ticket_id);
CREATE INDEX idx_attachments_ticket ON ticket_attachments(ticket_id);