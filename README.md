# Endurancy: Documentação Técnica Completa

## Visão Geral do Sistema 

Endurancy é uma plataforma de gerenciamento integrado para pesquisa clínica e operações organizacionais, desenvolvida em JavaScript/TypeScript com arquitetura moderna full-stack. A plataforma é composta por diversos módulos que atendem diferentes necessidades de gestão, integrados em uma única solução.

## Índice

1. [Arquitetura do Sistema](#arquitetura-do-sistema)
2. [Requisitos do Sistema](#requisitos-do-sistema)
3. [Instalação e Configuração](#instalação-e-configuração)
4. [Estrutura de Diretórios](#estrutura-de-diretórios)
5. [Banco de Dados](#banco-de-dados)
6. [Autenticação e Segurança](#autenticação-e-segurança)
7. [Módulos do Sistema](#módulos-do-sistema)
8. [API e Endpoints](#api-e-endpoints)
9. [Componentes Frontend](#componentes-frontend)
10. [Hooks e Estados](#hooks-e-estados)
11. [Gestão de Cache e Desempenho](#gestão-de-cache-e-desempenho)
12. [Sistema de Log e Monitoramento](#sistema-de-log-e-monitoramento)
13. [Testes](#testes)
14. [Deployment](#deployment)
15. [Integrações Externas](#integrações-externas)
16. [Fluxos de Dados](#fluxos-de-dados)
17. [Boas Práticas e Padrões](#boas-práticas-e-padrões)
18. [Solução de Problemas](#solução-de-problemas)

## Arquitetura do Sistema

A plataforma Endurancy implementa uma arquitetura SPA (Single-Page Application) moderna com separação clara entre frontend e backend:

### Stack Tecnológico

**Frontend**:
- React.js 18.2+
- TypeScript 5.0+
- Vite 5.0+ como bundler
- TanStack Query (React Query) v5 para gestão de estado do servidor
- Shadcn UI / Radix UI para componentes
- Tailwind CSS para estilização
- Wouter para roteamento leve
- React Hook Form para gestão de formulários
- Zod para validação de dados

**Backend**:
- Node.js 18+
- Express.js para API REST
- PostgreSQL 14+ como banco de dados principal
- Drizzle ORM para ORM e migrações
- Express-session + Passport.js para autenticação
- WebSockets para comunicação em tempo real (em alguns módulos)

**DevOps**:
- Nginx para servidor web de produção
- Docker para conteinerização (opcional)
- GitHub Actions para CI/CD (opcional)

### Diagrama de Arquitetura

```
┌─────────────────┐       ┌───────────────────────┐
│                 │       │                       │
│  Cliente React  │◄─────►│  Servidor Express.js  │
│   (Browser)     │  API  │                       │
│                 │  REST │                       │
└─────────────────┘       └───────────┬───────────┘
                                      │
                                      │
                                      ▼
                          ┌───────────────────────┐
                          │                       │
                          │  PostgreSQL Database  │
                          │                       │
                          └───────────────────────┘
```

### Padrões de Comunicação

1. **Cliente-Servidor**: REST API para operações CRUD
2. **WebSockets**: Para atualizações em tempo real e notificações
3. **Estado Global**: Gerenciado com TanStack Query e estratégias de cache

## Requisitos do Sistema

### Ambiente de Desenvolvimento

- Node.js v18.0+ 
- npm v9.0+ ou Yarn v1.22+
- PostgreSQL 14+
- Git

### Ambiente de Produção

- Servidor Linux (Ubuntu 22.04+ recomendado)
- Node.js v18.0+ (LTS)
- PostgreSQL 14+
- Nginx para proxy reverso
- PM2 para gestão de processos


### Variáveis de Ambiente Necessárias

```
# Banco de Dados
DATABASE_URL=postgresql://username:password@localhost:5432/endurancy
PGUSER=postgres
PGHOST=localhost
PGPASSWORD=password
PGDATABASE=endurancy
PGPORT=5432

# Autenticação
SESSION_SECRET=long_random_string_for_session

# APIs Externas
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# Configuração do Servidor
PORT=5000
NODE_ENV=development|production
```

## Instalação e Configuração

### Configuração Inicial (Desenvolvimento)

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/endurancy.git
   cd endurancy
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure o banco de dados**:
   - Crie um banco de dados PostgreSQL:
     ```sql
     CREATE DATABASE endurancy;
     ```
   - Copie o arquivo de exemplo de variáveis de ambiente:
     ```bash
     cp .env.example .env
     ```
   - Edite o arquivo `.env` com as credenciais do seu banco de dados

4. **Sincronize o esquema do banco de dados**:
   ```bash
   npm run db:push
   ```

5. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

6. **Acesse no navegador**:
   ```
   http://localhost:5000
   ```

### Configuração de Produção

1. **Clone o repositório na máquina de produção**:
   ```bash
   git clone https://github.com/seu-usuario/endurancy.git
   cd endurancy
   ```

2. **Instale as dependências de produção**:
   ```bash
   npm ci --production
   ```

3. **Configure as variáveis de ambiente para produção**:
   - Crie um arquivo `.env.production`
   - Configure todas as variáveis para o ambiente de produção
   - Certifique-se de definir `NODE_ENV=production`

4. **Construa os assets para produção**:
   ```bash
   npm run build
   ```

5. **Configure o PM2 para gerenciar o processo**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "endurancy" -- start
   pm2 save
   pm2 startup
   ```

6. **Configure o Nginx como proxy reverso**:

   Crie um arquivo de configuração em `/etc/nginx/sites-available/endurancy`:

   ```nginx
   server {
     listen 80;
     server_name seu-dominio.com;

     location / {
       proxy_pass http://localhost:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

   Ative a configuração:
   ```bash
   sudo ln -s /etc/nginx/sites-available/endurancy /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Configure HTTPS com Let's Encrypt**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d seu-dominio.com
   ```

## Estrutura de Diretórios

Abaixo está a estrutura completa dos diretórios do projeto com descrições:

```
/
├── client/                    # Código frontend
│   ├── src/
│   │   ├── components/        # Componentes React reutilizáveis
│   │   │   ├── layout/        # Componentes de layout (cabeçalho, rodapé, etc.)
│   │   │   ├── ui/            # Componentes de UI (botões, formulários, etc.)
│   │   │   ├── features/      # Componentes específicos de recursos
│   │   │   ├── carteirinha/   # Componentes do módulo de carteirinha
│   │   │   ├── modules/       # Componentes relacionados aos módulos
│   │   │   ├── social/        # Componentes para funcionalidade social
│   │   │   └── user/          # Componentes relacionados ao usuário
│   │   │
│   │   ├── hooks/             # Hooks React customizados
│   │   │   ├── use-affiliate.tsx   # Hook para sistema de afiliados
│   │   │   ├── use-auth.tsx        # Hook para autenticação
│   │   │   └── use-toast.tsx       # Hook para notificações toast
│   │   │
│   │   ├── lib/               # Utilitários e configurações
│   │   │   └── queryClient.ts # Configuração TanStack Query
│   │   │
│   │   ├── pages/             # Páginas da aplicação
│   │   │   ├── organization/  # Páginas da organização
│   │   │   ├── patient/       # Páginas do paciente
│   │   │   ├── supplier/      # Páginas do fornecedor
│   │   │   └── laboratory/    # Páginas do laboratório
│   │   │
│   │   └── App.tsx            # Configuração principal do React
│   │
│   └── index.html             # Ponto de entrada HTML
│
├── server/                    # Código backend
│   ├── routes/                # Rotas da API
│   │   ├── affiliates-routes.ts   # Rotas do sistema de afiliados
│   │   ├── auth-routes.ts         # Rotas de autenticação
│   │   ├── routes-ai.ts           # Rotas de IA
│   │   ├── routes-financeiro.ts   # Rotas financeiras
│   │   ├── routes-patient-orders.ts # Rotas de pedidos de pacientes
│   │   ├── routes-patrimonio.ts   # Rotas de patrimônio
│   │   ├── routes-pesquisa.ts     # Rotas de pesquisa científica
│   │   ├── routes-suppliers.ts    # Rotas de fornecedores
│   │   ├── routes-tickets.ts      # Rotas de tickets de suporte
│   │   ├── routes-transparencia.ts # Rotas de transparência
│   │   └── routes-whatsapp.ts     # Rotas de integração WhatsApp
│   │
│   ├── services/              # Serviços de negócios
│   ├── utils/                 # Utilitários do servidor
│   ├── auth-middleware.ts     # Middleware de autenticação
│   ├── db.ts                  # Configuração de banco de dados
│   ├── email.ts               # Serviço de email
│   ├── index.ts               # Ponto de entrada do servidor
│   ├── session-config.ts      # Configuração de sessão
│   └── storage.ts             # Interface de armazenamento
│
├── shared/                    # Código compartilhado frontend/backend
│   └── schema/                # Definições de tipos e modelos de dados
│       ├── affiliates/        # Schema do sistema de afiliados
│       ├── orders/            # Schema de pedidos
│       ├── patients/          # Schema de pacientes
│       ├── transparencia/     # Schema de transparência
│       └── index.ts           # Exportações do schema
│
├── uploads/                   # Diretório para uploads (imagens, arquivos)
├── documentation/             # Documentação adicional
├── public/                    # Arquivos estáticos públicos
├── drizzle.config.ts          # Configuração do Drizzle ORM
├── vite.config.ts             # Configuração do Vite
├── package.json               # Dependências e scripts
├── tsconfig.json              # Configuração do TypeScript
└── README.md                  # Esta documentação
```

## Banco de Dados

### Modelo de Dados

A aplicação utiliza PostgreSQL com Drizzle ORM. Todos os esquemas são definidos em TypeScript no diretório `/shared/schema/`.

#### Principais Entidades

- **Users**: Usuários do sistema com diferentes tipos (admin, paciente, etc.)
- **Organizations**: Organizações registradas no sistema
- **Patients**: Pacientes vinculados às organizações
- **Orders**: Pedidos de produtos feitos no marketplace
- **Products**: Produtos disponíveis no marketplace
- **Inventory**: Inventário de produtos e medicamentos
- **Tickets**: Sistema de tickets de suporte
- **Affiliates**: Sistema de afiliados e referências

### Exemplo de Schema (Drizzle)

```typescript
// shared/schema/affiliates/index.ts
import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const affiliates = pgTable('affiliates', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  affiliateCode: text('affiliate_code').notNull().unique(),
  type: text('type', { enum: ['patient', 'organization', 'company', 'association'] }).notNull(),
  level: text('level', { enum: ['beginner', 'bronze', 'silver', 'gold', 'platinum'] }).notNull().default('beginner'),
  points: integer('points').notNull().default(0),
  totalEarned: integer('total_earned').notNull().default(0),
  totalRedeemed: integer('total_redeemed').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Migrações

A plataforma usa o sistema de migrações do Drizzle para gerenciar alterações no banco de dados:

```bash
# Gerar uma nova migração
npm run db:generate

# Aplicar migrações 
npm run db:migrate

# Sincronizar diretamente o schema (desenvolvimento)
npm run db:push
```

### Configuração de Conexão

O arquivo `server/db.ts` configura a conexão com o PostgreSQL:

```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

## Autenticação e Segurança

### Sistema de Autenticação

A plataforma usa Express-session com Passport.js para autenticação:

```typescript
// server/auth-middleware.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";

// Implementação de hashing seguro de senha com scrypt
const scryptAsync = promisify(scrypt);

export function setupAuth(app: Express) {
  // Configuração dos middlewares de sessão e autenticação
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Estratégia local para autenticação com nome de usuário e senha
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      // Verificação de usuário e senha...
    })
  );

  // Serialização/deserialização do usuário
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    // Buscar usuário a partir do ID...
  });

  // Rotas de autenticação (login, registro, logout)
  // ...
}
```

### Fluxo de Autenticação

1. O usuário envia credenciais para `/api/auth/login`
2. Passport.js verifica as credenciais contra o banco de dados
3. Se válido, uma sessão é criada e um cookie é enviado ao cliente
4. As solicitações subsequentes incluem o cookie de sessão
5. O middleware de autenticação verifica a sessão em cada requisição

### Middleware de Autorização

Para proteger rotas específicas, usamos middleware de autorização:

```typescript
// Verificação de autenticação
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Não autenticado" });
}

// Verificação de papel/função
function hasRole(role: string) {
  return (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    }
    res.status(403).json({ message: "Acesso negado" });
  };
}

// Uso nas rotas
app.get('/api/admin/settings', isAuthenticated, hasRole('admin'), (req, res) => {
  // Rota protegida para admins
});
```

### Proteção CSRF

A plataforma implementa proteção CSRF para rotas de mutação:

```typescript
// Obtenção de token CSRF
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Verificação em rotas de mutação
app.post('/api/data', csrfProtection, (req, res) => {
  // Rota protegida contra CSRF
});
```

### Rate Limiting

Para prevenir abuso de API, implementamos rate limiting:

```typescript
// Limitação de taxa para rotas sensíveis
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por janela
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
```

## Módulos do Sistema

A plataforma Endurancy é composta por vários módulos integrados:

### 1. Sistema de Afiliados

Implementa um programa de afiliados multinível com três categorias diferentes:

- **Associações**: Membros referindo outros membros
- **Empresas**: Clientes referindo outros clientes 
- **ComplyPay**: Programa SaaS para assinantes

**Principais recursos**:
- Geração de códigos de afiliados únicos
- Rastreamento de referências e pontos
- Dashboard para acompanhamento
- Sistema de recompensas configurável

**Implementação**:
- Frontend: `/client/src/pages/patient/afiliados`
- Backend: `/server/routes/affiliates-routes.ts`
- Schema: `/shared/schema/affiliates`
- Hook: `/client/src/hooks/use-affiliate.tsx`

### 2. Mapa de Expedição (BI)

Visualização geográfica das estatísticas de envio em todo o Brasil:

**Principais recursos**:
- Mapa interativo do Brasil com limites estaduais precisos
- Filtros por período e região
- Diferentes visualizações (colorida, escala de cinza, contorno)
- Modo fullscreen para exibição em TVs
- Indicadores regionais configuráveis

**Implementação**:
- Frontend: `/client/src/pages/organization/expedição/mapa-bi.tsx`
- Backend: `/server/routes/routes-expedição.ts`
- Visualização: Usa bibliotecas Nivo e React Simple Maps

### 3. Portal do Fornecedor

Marketplace para fornecedores similiar ao Mercado Livre:

**Principais recursos**:
- Cadastro e login dedicado para fornecedores
- Catálogo de produtos com várias categorias
- Sistema de carrinho e checkout
- Integração com pagamentos (Stripe)
- Dashboard com estatísticas de vendas

**Implementação**:
- Frontend: `/client/src/pages/supplier/`
- Backend: `/server/routes/routes-suppliers.ts`
- Schema: `/shared/schema/suppliers`

### 4. Módulo de Cultivo

Sistema de gestão e monitoramento agrícola:

**Principais recursos**:
- Monitoramento ambiental com integração de sensores
- Gestão de qualidade para cultivos
- Análise genética de linhagens
- Controle de estoque de sementes e insumos
- Acompanhamento de ciclos de crescimento

**Implementação**:
- Frontend: `/client/src/pages/organization/cultivation/`
- Backend: `/server/routes/routes-cultivation.ts`
- Schema: `/shared/schema/cultivation`

### 5. Carteirinha Digital

Sistema de identificação digital para membros de associações:

**Principais recursos**:
- QR Code para verificação de identidade
- Integração com sistema de benefícios
- Personalização com foto e logo
- Validação em tempo real

**Implementação**:
- Frontend: `/client/src/components/carteirinha/`
- Backend: `/server/routes/routes-carteirinha.ts`
- Schema: `/shared/schema/carteirinha`

### 6. Sistema de IA e MCP

Sistema de Processamento Multi-Contexto que integra IA em todos os módulos:

**Principais recursos**:
- Integração com a API da OpenAI (GPT-4o)
- Processamento de dados de múltiplas fontes
- Manutenção de contexto entre interações
- Análise holística de informações de negócio

**Implementação**:
- Cliente: `/mcpClient.js`
- Integração: `/server/routes/routes-ai.ts`
- Utilitários: `/server/utils/ai-helpers.ts`

## API e Endpoints

### Principais Endpoints da API

#### Sistema de Autenticação

```
POST /api/auth/login           # Login de usuário
POST /api/auth/register        # Registro de novo usuário
POST /api/auth/logout          # Logout de usuário
GET  /api/auth/me              # Obter dados do usuário atual
```

#### Sistema de Afiliados

```
GET  /api/affiliates/my-affiliate          # Obter dados do afiliado
POST /api/affiliates/register              # Registrar como afiliado
GET  /api/affiliates/points-history        # Histórico de pontos
GET  /api/affiliates/referrals             # Lista de referências
GET  /api/affiliates/rewards               # Recompensas disponíveis
GET  /api/affiliates/promotional-materials # Materiais promocionais
POST /api/affiliates/register-referral     # Registrar uma referência
POST /api/affiliates/redeem-reward         # Resgatar uma recompensa
```

#### Marketplace de Fornecedores

```
GET  /api/suppliers/products              # Listar produtos
GET  /api/suppliers/products/:id          # Detalhes do produto
POST /api/suppliers/products              # Criar produto
GET  /api/suppliers/categories            # Listar categorias
POST /api/suppliers/cart/add              # Adicionar ao carrinho
GET  /api/suppliers/cart                  # Ver carrinho
POST /api/suppliers/checkout              # Finalizar compra
```

#### Módulo Financeiro

```
GET  /api/financeiro/balanco              # Balanço financeiro
GET  /api/financeiro/despesas             # Listar despesas
POST /api/financeiro/despesas             # Registrar despesa
GET  /api/financeiro/receitas             # Listar receitas
POST /api/financeiro/receitas             # Registrar receita
GET  /api/financeiro/relatorios           # Relatórios financeiros
```

#### Sistema de Tickets

```
GET  /api/tickets                         # Listar tickets
GET  /api/tickets/:id                     # Detalhes do ticket
POST /api/tickets                         # Criar ticket
POST /api/tickets/:id/reply               # Responder a um ticket
PUT  /api/tickets/:id/status              # Atualizar status do ticket
```

### Exemplo de Implementação de API

```typescript
// server/routes/affiliates-routes.ts
import express from 'express';
import { db } from '../db';
import { affiliates, affiliatePoints } from '@shared/schema/affiliates';
import { eq, and } from 'drizzle-orm';
import { isAuthenticated } from '../auth-middleware';

const router = express.Router();

// Middleware de autenticação
router.use(isAuthenticated);

// Obter dados do afiliado atual
router.get('/my-affiliate', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [affiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.userId, userId));
    
    if (!affiliate) {
      return res.status(404).json({ message: 'Afiliado não encontrado' });
    }
    
    res.json(affiliate);
  } catch (error) {
    console.error('Erro ao buscar afiliado:', error);
    res.status(500).json({ message: 'Erro interno ao buscar afiliado' });
  }
});

// Outros endpoints...

export default router;
```

## Componentes Frontend

### Estrutura de Componentes

A aplicação segue uma estrutura organizada de componentes:

1. **Componentes Atômicos**: Botões, inputs, cards
2. **Componentes Compostos**: Formulários, tabelas, modais
3. **Componentes de Página**: Específicos para cada página
4. **Componentes de Layout**: Estruturas de layout reutilizáveis

### Exemplo de Componente

```tsx
// client/src/components/affiliate/AffiliateRegistration.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAffiliate } from "@/hooks/use-affiliate";
import { Loader2 } from "lucide-react";

export function AffiliateRegistration() {
  const { toast } = useToast();
  const { registerAsAffiliate, isLoadingAffiliate } = useAffiliate();

  const handleRegister = async () => {
    try {
      await registerAsAffiliate.mutateAsync();
    } catch (error) {
      console.error("Erro ao registrar como afiliado:", error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Torne-se um Afiliado</CardTitle>
        <CardDescription>
          Registre-se como afiliado e comece a ganhar pontos por indicações.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Como afiliado, você pode:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Ganhar pontos por cada pessoa que você indicar</li>
          <li>Trocar pontos por recompensas exclusivas</li>
          <li>Acompanhar seu desempenho no dashboard de afiliados</li>
          <li>Acessar materiais promocionais exclusivos</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleRegister} 
          disabled={registerAsAffiliate.isPending || isLoadingAffiliate}
          className="w-full"
        >
          {registerAsAffiliate.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Registrar-se como Afiliado
        </Button>
      </CardFooter>
    </Card>
  );
}
```

## Hooks e Estados

### TanStack Query

A aplicação usa TanStack Query para gerenciamento de estados do servidor:

```typescript
// client/src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      staleTime: 30000,
      gcTime: 30 * 60 * 1000,
    },
  },
});

// Função utilitária para requisições à API
export async function apiRequest(url: string, method = 'GET', data?: any) {
  // Implementação...
}
```

### Hooks Customizados

#### useAffiliate

Hook para gerenciar o estado e operações do sistema de afiliados:

```typescript
// client/src/hooks/use-affiliate.tsx
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';

export function useAffiliate() {
  const { toast } = useToast();

  // Buscar dados do afiliado
  const { 
    data: affiliate, 
    isLoading: isLoadingAffiliate, 
    error: affiliateError,
    refetch: refetchAffiliate
  } = useQuery<Affiliate>({ 
    queryKey: ['/api/affiliates/my-affiliate'],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    enabled: true,
  });
  
  // Mutação para registrar como afiliado
  const registerAsAffiliate = useMutation<{ affiliateCode: string }, Error, void>({
    mutationFn: async () => {
      const response = await apiRequest('/api/affiliates/register', 'POST');
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: 'Registro de afiliado concluído',
        description: `Você foi registrado como afiliado com sucesso. Seu código de afiliado é ${data.affiliateCode}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/affiliates/my-affiliate'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao registrar como afiliado',
        description: error.message,
      });
    },
  });

  // Outras queries e mutations...

  // Função para refrescar dados seletivamente
  const refreshAll = () => {
    refetchAffiliate();
    
    if (affiliate) {
      refetchPoints();
      refetchReferrals();
      refetchRewards();
      refetchMaterials();
    }
  };

  return {
    affiliate,
    pointsHistory,
    referrals,
    rewards,
    materials,
    
    isLoadingAffiliate,
    isLoadingPoints,
    isLoadingReferrals,
    isLoadingRewards,
    isLoadingMaterials,
    
    registerAsAffiliate,
    registerReferral,
    redeemReward,
    
    refreshAll,
    
    affiliateError,
  };
}
```

## Gestão de Cache e Desempenho

### Estratégias de Cache

A plataforma utiliza diversas estratégias para otimizar desempenho:

1. **Configuração de staleTime**:
   - Configuração global e por query para controlar revalidação
   - Tempos mais longos para dados que mudam raramente

2. **Carregamento Condicional**:
   - Queries habilitadas condicionalmente com `enabled`
   - Dados secundários carregados apenas quando necessários

3. **Invalidação Seletiva**:
   - Invalidações precisas após mutações
   - Uso de chaves estruturadas para invalidação em grupo

### Otimizações de API

1. **Batching de Requisições**:
   - Agrupamento de chamadas relacionadas
   - Queries paralelas quando possível

2. **Rate Limiting do Cliente**:
   - Limitação de retentativas com `retry: 1`
   - Controle de refetch com `refetchOnWindowFocus: false`

3. **Tratamento de Erros 429**:
   - Feedback específico para erros de limitação de taxa
   - Atraso exponencial nas retentativas

```typescript
// Exemplo de resposta a erro 429
if (response.status === 429) {
  console.error('Erro 429: Rate limiting aplicado');
  throw new Error('Muitas requisições. Por favor, aguarde um momento e tente novamente.');
}
```

## Sistema de Log e Monitoramento

### Logging de Servidor

O sistema usa logging estruturado para facilitar depuração e monitoramento:

```typescript
// Middleware de logging
app.use((req, res, next) => {
  const start = Date.now();
  
  // Quando a resposta é enviada
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.url} ${res.statusCode} ${duration}ms`,
      {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString(),
      }
    );
  });
  
  next();
});
```

### Logging de Cliente

O frontend implementa logging para rastrear atividades do usuário e erros:

```typescript
// client/src/lib/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[INFO] ${message}`, data);
    }
    // Em produção, enviar para serviço de monitoramento
  },
  
  error: (message: string, error: any) => {
    console.error(`[ERROR] ${message}`, error);
    // Enviar erro para serviço de monitoramento
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },
  
  track: (eventName: string, properties?: any) => {
    // Rastreamento de eventos para análise
    console.log(`[TRACK] ${eventName}`, properties);
  }
};
```

### Monitoramento de Desempenho

Para monitorar o desempenho da aplicação:

```typescript
// Middleware para monitorar desempenho
app.use((req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const time = diff[0] * 1e3 + diff[1] * 1e-6;
    
    if (time > 1000) {
      console.warn(`Requisição lenta: ${req.method} ${req.url} levou ${time.toFixed(2)}ms`);
    }
  });
  
  next();
});
```

## Testes

### Estrutura de Testes

O projeto utiliza Jest para testes unitários e de integração:

```
/__tests__/
├── unit/              # Testes unitários
│   ├── components/    # Testes de componentes React
│   ├── hooks/         # Testes de hooks
│   └── utils/         # Testes de utilitários
│
├── integration/       # Testes de integração
│   ├── api/           # Testes de API
│   └── flows/         # Testes de fluxos de usuário
│
└── setup.ts           # Configuração global de testes
```

### Exemplo de Teste Unitário

```typescript
// /__tests__/unit/hooks/use-affiliate.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useAffiliate } from '@/hooks/use-affiliate';
import { queryClient } from '@/lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Mock do apiRequest
vi.mock('@/lib/queryClient', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
  apiRequest: vi.fn(),
}));

describe('useAffiliate hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('deve registrar um novo afiliado com sucesso', async () => {
    // Mock da resposta de sucesso
    (apiRequest as vi.Mock).mockResolvedValueOnce({ affiliateCode: 'ABC123' });
    
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
    
    const { result, waitForNextUpdate } = renderHook(() => useAffiliate(), { wrapper });
    
    act(() => {
      result.current.registerAsAffiliate.mutate();
    });
    
    await waitForNextUpdate();
    
    expect(apiRequest).toHaveBeenCalledWith('/api/affiliates/register', 'POST');
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ 
      queryKey: ['/api/affiliates/my-affiliate'] 
    });
  });
  
  // Mais testes...
});
```

## Deployment

### Pipeline de Deployment

O projeto utiliza um pipeline de CI/CD baseado em GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy Endurancy

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
          
      - name: Run tests
        run: npm test
          
      - name: Build
        run: npm run build
          
      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/endurancy
            git pull
            npm ci --production
            npm run db:migrate
            pm2 restart endurancy
```

### Monitoramento de Produção

Usamos PM2 para monitorar e gerenciar o processo em produção:

```bash
# Verificar logs
pm2 logs endurancy

# Monitorar desempenho
pm2 monit

# Reiniciar após atualizações
pm2 restart endurancy
```

### Backup de Banco de Dados

Rotina automática de backup para o PostgreSQL:

```bash
#!/bin/bash
# /etc/cron.daily/backup-endurancy-db

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/endurancy-db"
DB_NAME="endurancy"

mkdir -p $BACKUP_DIR

# Backup do banco de dados
pg_dump -U postgres $DB_NAME | gzip > "$BACKUP_DIR/$DB_NAME-$TIMESTAMP.sql.gz"

# Manter apenas os últimos 7 backups diários
find $BACKUP_DIR -name "$DB_NAME-*.sql.gz" -type f -mtime +7 -delete
```

## Integrações Externas

### Serviços Integrados

A plataforma integra-se com os seguintes serviços:

1. **Stripe** - Processamento de pagamentos
2. **OpenAI** - Serviços de IA para o módulo MCP
3. **SendGrid** - Envio de emails transacionais
4. **WhatsApp API** - Comunicação via WhatsApp (WAHA)

### Configuração do Stripe

```typescript
// server/services/payment.ts
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function createPaymentIntent(amount: number) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Converte para centavos
      currency: "brl",
    });
    return paymentIntent;
  } catch (error) {
    console.error("Erro ao criar payment intent:", error);
    throw error;
  }
}
```

### Integração com OpenAI

```typescript
// server/services/ai.ts
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateCompletion(prompt: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // O modelo mais recente da OpenAI
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Erro ao gerar completion:", error);
    throw error;
  }
}
```

## Fluxos de Dados

### Fluxo de Afiliados

1. **Registro como Afiliado**:
   - Usuário faz login e acessa a página de afiliados
   - Sistema verifica se o usuário já é um afiliado
   - Se não for, exibe formulário de registro
   - Ao submeter, cria registro na tabela `affiliates`
   - Gera código único de afiliado
   - Concede pontos iniciais por registro

2. **Referência de Novo Usuário**:
   - Novo usuário se registra usando código de afiliado
   - Sistema valida o código
   - Cria relacionamento na tabela `affiliate_referrals`
   - Adiciona pontos para o afiliado que referiu
   - Registra atividade no histórico de pontos

3. **Resgate de Recompensa**:
   - Afiliado acessa página de recompensas
   - Seleciona recompensa desejada
   - Sistema verifica saldo de pontos
   - Se suficiente, cria registro em `affiliate_redemptions`
   - Debita pontos do saldo do afiliado
   - Gera código único de resgate

### Fluxo de Compras no Marketplace

1. **Navegação e Adição ao Carrinho**:
   - Usuário navega pelo catálogo de produtos
   - Adiciona produtos ao carrinho
   - Sistema armazena dados do carrinho em `shopping_cart` e `cart_items`

2. **Checkout e Pagamento**:
   - Usuário inicia checkout
   - Preenche/confirma endereço de entrega
   - Seleciona método de pagamento
   - Sistema integra com Stripe para pagamento
   - Cria intenção de pagamento (PaymentIntent)
   - Cliente confirma pagamento via interface segura

3. **Processamento do Pedido**:
   - Após confirmação, sistema cria `order` e `order_items`
   - Atualiza inventário reduzindo o estoque
   - Envia confirmação por e-mail
   - Notifica fornecedor sobre novo pedido
   - Atualiza dashboard do fornecedor

## Boas Práticas e Padrões

### Convenções de Código

O projeto segue as seguintes convenções:

1. **Nomenclatura**:
   - PascalCase para componentes React e tipos/interfaces
   - camelCase para variáveis, funções e métodos
   - snake_case para colunas de banco de dados
   - UPPER_CASE para constantes

2. **Estrutura de Arquivos**:
   - Um componente por arquivo
   - Estrutura de diretórios por domínio/funcionalidade
   - Barril de exportações (index.ts) para organizar importações

3. **Estilo de Código**:
   - ESLint + Prettier para formação consistente
   - Tipagem TypeScript rigorosa
   - Evitar any quando possível
   - Preferir funções puras e componentes funcionais

### Padrões de Design

1. **Componentes**:
   - Preferir composição sobre herança
   - Componentes pequenos e focados
   - Elevação de estado quando necessário
   - Container/Presentation pattern

2. **Hooks**:
   - Encapsular lógica reutilizável em hooks
   - Seguir regras de hooks do React
   - Manter hooks simples e focados

3. **API**:
   - API RESTful
   - Nomenclatura de recursos consistente
   - Tratamento adequado de erros
   - Validação de dados de entrada

### Padrões React

1. **Gerenciamento de Estado**:
   - Estado local para UI
   - React Query para estado do servidor
   - Evitar prop drilling com hooks contextuais

2. **Renderização**:
   - Evitar renderizações desnecessárias
   - Memoização de componentes pesados
   - Lazy loading para code splitting

3. **Formulários**:
   - Componentes controlados
   - React Hook Form para gerenciamento de estado
   - Zod para validação de esquema

## Solução de Problemas

### Problemas Comuns e Soluções

#### 1. Erro 429 (Too Many Requests)

**Sintoma**: Cliente recebe erros 429 ao fazer múltiplas requisições à API.

**Solução**:
- Ajuste as configurações do TanStack Query para limitar frequência de refetch
- Configure `staleTime` adequadamente para cada tipo de dado
- Desative `refetchOnWindowFocus` e `refetchOnReconnect` quando não necessário
- Implemente carregamento condicional com `enabled`

#### 2. Problemas de Autenticação

**Sintoma**: Usuário é desconectado inesperadamente ou recebe erros 401.

**Solução**:
- Verifique a configuração do cookie de sessão (httpOnly, secure, sameSite)
- Confirme que o tempo de expiração da sessão está configurado corretamente
- Implemente refresh token se necessário
- Verifique se há problemas de CORS ao fazer requisições de domínios diferentes

#### 3. Desempenho da Aplicação

**Sintoma**: UI lenta ou não responsiva, especialmente em dispositivos móveis.

**Solução**:
- Implemente virtualização para listas longas
- Utilize carregamento lazy para componentes e rotas
- Otimize as imagens usando formatos modernos (WebP)
- Implemente memoização para componentes pesados
- Reduza renderizações desnecessárias com memo, useMemo e useCallback

#### 4. Dados Desatualizados

**Sintoma**: Usuário vê dados antigos mesmo após operações de mutação.

**Solução**:
- Verifique a invalidação de cache após mutações
- Confirme que as chaves de invalidação são específicas o suficiente
- Implemente refetch manual após operações críticas
- Verifique a configuração de staleTime e gcTime

### Ferramentas de Diagnóstico

1. **React Developer Tools**:
   - Inspeção da árvore de componentes
   - Monitoramento de props e estado
   - Identificação de renderizações desnecessárias

2. **React Query Devtools**:
   - Visualização do cache e estado de queries
   - Monitoramento de refetches e invalidações
   - Execução manual de queries e mutations

3. **Network Monitor**:
   - Análise de payload de requests
   - Monitoramento de códigos de resposta
   - Análise de performance de rede

## Licença

MIT

---

## Contribuindo

Para contribuir com o projeto Endurancy:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nome-da-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Envie para a branch (`git push origin feature/nome-da-feature`)
5. Abra um Pull Request
