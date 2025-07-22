# Replit Configuration for Medical Cannabis Management Platform

## Overview

This is a comprehensive medical cannabis management platform called "Endurancy" built with Express.js, React, and PostgreSQL. The system provides multi-tenant SaaS capabilities for organizations in the medical cannabis industry, including laboratories, cultivation facilities, pharmacies, and medical practices.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Architecture
- **Frontend**: React 18 with TypeScript, Vite build system, TailwindCSS with Shadcn/UI components
- **Backend**: Express.js server with TypeScript, RESTful API architecture
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with cookies for authentication
- **File Storage**: Local filesystem with Multer for file uploads
- **Build System**: Vite for client bundling, ESBuild for server bundling

### Multi-Schema Database Design
The system uses multiple database schemas for different functional areas:
- **Main Schema** (`shared/schema.ts`): Core entities (users, organizations, plans, modules)
- **Suppliers Schema** (`shared/schema-suppliers.ts`): Supplier management system
- **Social Schema** (`shared/schema-social.ts`): Social programs and beneficiary management
- **Financial Schema** (`shared/schema-financeiro.ts`): Financial management
- **Transparency Schema** (`shared/schema-transparencia.ts`): Public transparency portal
- **Research Schema** (`shared/schema-pesquisa.ts`): Scientific research management
- **Patrimony Schema** (`shared/schema-patrimonio.ts`): Asset management
- **Laboratory Schema**: Equipment and sample management
- **HPLC Schema**: Specialized chromatography equipment management

## Key Components

### Authentication & Authorization
- Session-based authentication with Express sessions
- Role-based access control (admin, user, supplier, doctor, etc.)
- Multi-tenant organization isolation
- Module-based access control system

### Core Modules
1. **Laboratory Management**: Equipment tracking, maintenance, calibration
2. **HPLC Module**: Specialized chromatography equipment management
3. **Financial Management**: Accounting, transactions, budgets, reports
4. **Cultivation Module**: Plant cultivation tracking and management
5. **Production Module**: Manufacturing process management
6. **Research Module**: Scientific research project management
7. **Social Programs**: Beneficiary management and exemptions
8. **Transparency Portal**: Public document and information portal
9. **Supplier Management**: Vendor relationship and procurement
10. **Asset Management**: Equipment and property tracking

### Security Features
- CSRF protection using `csurf` middleware
- Security headers via Helmet
- Rate limiting to prevent abuse
- Input validation with Zod schemas
- SQL injection prevention through Drizzle ORM

### External Integrations
- **WhatsApp Integration**: WAHA API for messaging
- **Email Service**: SendGrid for transactional emails
- **Payment Processing**: Stripe integration for subscriptions
- **AI Services**: OpenAI integration for intelligent features

## Data Flow

### Request Flow
1. Client requests hit Express server
2. CSRF protection validates tokens for non-GET requests
3. Authentication middleware checks user sessions
4. Module access control verifies permissions
5. Route handlers process business logic
6. Database operations through Drizzle ORM
7. Responses sent back to React frontend

### File Upload Flow
1. Multer middleware handles multipart uploads
2. Files stored in organized directory structure
3. Metadata stored in database with file paths
4. Access control enforced for file downloads

### Multi-Tenant Data Isolation
- Organization-based data segregation
- Module access controlled by subscription plans
- Role-based permissions within organizations

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL with Neon serverless adapter
- **ORM**: Drizzle with migrations support
- **Frontend**: React ecosystem with TypeScript
- **UI Components**: Radix UI primitives with Shadcn/UI
- **Styling**: TailwindCSS with custom theme
- **Charts**: Nivo library for data visualization
- **File Handling**: Multer for uploads, fs for file operations

### Development Tools
- **Build Tools**: Vite, ESBuild, TypeScript compiler
- **Code Quality**: ESLint, Prettier (implied)
- **Database Tools**: Drizzle Kit for migrations and introspection

### Third-Party Services
- **Email**: SendGrid API
- **Payments**: Stripe API
- **AI/ML**: OpenAI API
- **Communication**: WAHA (WhatsApp HTTP API)

## Deployment Strategy

### Build Process
- **Client Build**: `vite build` creates optimized production bundle
- **Server Build**: `esbuild` bundles server code with external packages
- **Combined Build**: `build.js` script orchestrates both builds

### Production Configuration
- Environment variables for database and API keys
- Session configuration for production security
- Static file serving for built assets
- Process management with Node.js

### File Structure
```
dist/
├── public/          # Built client assets
└── index.js         # Built server bundle
```

### Environment Requirements
- Node.js runtime
- PostgreSQL database
- Environment variables for secrets
- File system access for uploads

The application is designed for deployment on cloud platforms with support for persistent storage and environment variable configuration.