import express from 'express';
import path from 'path';

const router = express.Router();

/**
 * Este arquivo cria uma redireção especial para a visualização de pré-cadastros
 * Resolve o problema de renderização usando uma abordagem que contorna o client-side routing
 */

// Rota para redirecionar o acesso /pre-cadastros para a versão HTML
router.get('/pre-cadastros', (req, res) => {
  console.log('Redirecionando para a página de visualização de pré-cadastros');
  
  // Redirecionamento direto para a versão HTML
  return res.redirect('/pre-cadastros.html');
});

// Configuração para permitir acesso direto ao arquivo HTML na pasta public
export function setupPreCadastrosRoutes(app: express.Express) {
  // Montar a rota de redirecionamento
  app.use('/', router);
  
  // Configurar acesso direto aos arquivos estáticos na pasta public
  app.use(express.static(path.join(process.cwd(), 'public')));
  
  console.log('Rotas de pré-cadastros configuradas com sucesso');
}

export default router;