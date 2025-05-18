import { Router } from "express";

// Criar um router específico para redirecionar rotas de carteirinha
const carteirinhaRedirectRouter = Router();

// Redirecionar todas as requisições para o endpoint correto
carteirinhaRedirectRouter.use('/membership-cards', (req, res, next) => {
  // Redirecionar para o caminho social/carteirinha/membership-cards
  console.log(`Redirecionando requisição de /api/carteirinha/membership-cards para /api/social/carteirinha/membership-cards`);
  
  // Modificar o caminho da requisição
  req.url = `/social/carteirinha${req.url}`;
  
  // Continuar para o próximo middleware
  next('router');
});

// Redirecionar para as configurações de carteirinha
carteirinhaRedirectRouter.use('/membership-cards/settings/current', (req, res, next) => {
  console.log(`Redirecionando requisição de configurações para /api/social/carteirinha/membership-cards/settings/current`);
  
  // Modificar o caminho da requisição
  req.url = `/social/carteirinha${req.url}`;
  
  // Continuar para o próximo middleware
  next('router');
});

// Qualquer outra rota relacionada a carteirinha
carteirinhaRedirectRouter.use('/', (req, res, next) => {
  console.log(`Redirecionando requisição de /api/carteirinha para /api/social/carteirinha`);
  
  // Modificar o caminho da requisição
  req.url = `/social/carteirinha${req.url}`;
  
  // Continuar para o próximo middleware
  next('router');
});

export default carteirinhaRedirectRouter;