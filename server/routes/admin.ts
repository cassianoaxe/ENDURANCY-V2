/**
 * Rotas administrativas do sistema
 * 
 * Este arquivo contém as rotas específicas para administradores do sistema,
 * incluindo rotas para importação de dados, gerenciamento de configurações, etc.
 */

import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { importService, ImportOptions } from "../services/importService";
import { log } from "../vite";

// Configuração de upload de arquivos
const uploadDir = path.join(process.cwd(), "uploads");

// Garantir que o diretório de uploads exista
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do Multer para salvar os arquivos em disco
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Restrições para upload de arquivos
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: function (req, file, cb) {
    // Verificar extensões permitidas
    const allowedExtensions = [".csv", ".xlsx", ".xls", ".json"];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Formato de arquivo não suportado. Use CSV, Excel ou JSON"));
    }
  },
});

// Verificação de permissão de administrador
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Verificar se o usuário está autenticado e é administrador
  if (
    req.session &&
    req.session.user &&
    req.session.user.role === "admin"
  ) {
    next();
  } else {
    res.status(403).json({
      error: "Permissão negada. Apenas administradores podem acessar este recurso.",
    });
  }
};

// Criar router para rotas de admin
const adminRouter = Router();

// Aplicar middleware de verificação de admin em todas as rotas
adminRouter.use(isAdmin);

/**
 * Rota para importação de dados via arquivo
 * 
 * Esta rota permite o upload de um arquivo (CSV, Excel, JSON)
 * para importação de dados no sistema.
 */
adminRouter.post(
  "/import",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      let importOptions: ImportOptions;

      // Processar baseado no tipo de importação
      if (req.file) {
        // Importação via arquivo
        const entityType = req.body.type;
        if (!entityType) {
          return res.status(400).json({ error: "Tipo de entidade não especificado" });
        }

        // Determinar formato pelo nome do arquivo
        const ext = path.extname(req.file.path).toLowerCase();
        let format: "csv" | "xlsx" | "xls" | "json";
        
        if (ext === ".csv") {
          format = "csv";
        } else if (ext === ".xlsx") {
          format = "xlsx";
        } else if (ext === ".xls") {
          format = "xls";
        } else if (ext === ".json") {
          format = "json";
        } else {
          return res.status(400).json({ error: "Formato de arquivo não suportado" });
        }

        importOptions = {
          entityType: entityType as any,
          format,
          filePath: req.file.path,
        };
      } else if (req.body.apiEndpoint) {
        // Importação via API
        const entityType = req.body.type;
        if (!entityType) {
          return res.status(400).json({ error: "Tipo de entidade não especificado" });
        }

        importOptions = {
          entityType: entityType as any,
          apiEndpoint: req.body.apiEndpoint,
          apiAuth: req.body.apiAuth ? {
            username: req.body.apiAuth.username,
            password: req.body.apiAuth.password,
          } : undefined,
        };
      } else if (req.body.jsonData) {
        // Importação via JSON diretamente
        const entityType = req.body.type;
        if (!entityType) {
          return res.status(400).json({ error: "Tipo de entidade não especificado" });
        }

        importOptions = {
          entityType: entityType as any,
          jsonData: req.body.jsonData,
        };
      } else {
        return res.status(400).json({ error: "Nenhum dado fornecido para importação" });
      }

      // Executar importação
      log(`[Admin] Iniciando importação de ${importOptions.entityType}`, 'admin');
      const result = await importService.import(importOptions, userId);
      
      // Limpar arquivo temporário após processamento
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            log(`[Admin] Erro ao excluir arquivo temporário: ${err.message}`, 'admin');
          }
        });
      }

      // Retornar resultados
      res.status(200).json(result);
    } catch (error: any) {
      log(`[Admin] Erro na importação: ${error.message}`, 'admin');
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Rota para obter o histórico de importações
 */
adminRouter.get("/import/history", (req: Request, res: Response) => {
  try {
    const history = importService.getImportHistory();
    res.status(200).json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default adminRouter;