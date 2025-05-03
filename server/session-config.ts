import session from "express-session";
import { Express } from "express";
import { pool } from "./db";
import connectPg from "connect-pg-simple";

const PostgresStore = connectPg(session);

// Configuração centralizada da sessão
export function setupSessionMiddleware(app: Express) {
  // Configuração do middleware de sessão
  const sessionConfig = {
    store: new PostgresStore({
      pool,
      tableName: 'session', // Tabela para armazenar sessões
      createTableIfMissing: true,
      pruneSessionInterval: 60 * 60 // Limpar sessões a cada hora (em segundos)
    }),
    secret: process.env.SESSION_SECRET || 'super-secret-key', // Use uma chave forte em produção
    resave: false, // Definido como false para reduzir operações de gravação
    saveUninitialized: false, // Não salva sessões não inicializadas para reduzir overhead
    name: 'connect.sid', // Nome padrão para maximizar compatibilidade
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
      secure: false, // Defina como false para garantir que funcione tanto em prod quanto em dev
      httpOnly: true,
      sameSite: 'lax' as const, // Tipado explicitamente para evitar erro
      path: '/' // Disponível em todas as rotas
    },
  };
  
  // Log para depuração
  console.log("Configurando sessão com as seguintes opções:", {
    resave: sessionConfig.resave, 
    saveUninitialized: sessionConfig.saveUninitialized,
    cookiePath: sessionConfig.cookie.path,
    cookieMaxAge: sessionConfig.cookie.maxAge,
  });
  
  // Aplicar middleware de sessão
  app.use(session(sessionConfig));
  
  // Adicionar middleware personalizado para depuração de sessão
  app.use((req, res, next) => {
    // Verificar e logar informações úteis sobre a sessão
    if (req.path.startsWith('/api/auth/')) {
      console.log(`[Session Debug] Rota: ${req.path}, Método: ${req.method}`, {
        hasSession: !!req.session,
        sessionID: req.sessionID || 'não disponível',
        hasUser: !!req.session?.user,
        headers: {
          cookie: !!req.headers.cookie
        }
      });
    }
    next();
  });
  
  return sessionConfig;
}