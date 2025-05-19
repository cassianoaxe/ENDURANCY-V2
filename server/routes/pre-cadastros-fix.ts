import express from 'express';
import path from 'path';

/**
 * Configuração de rotas para corrigir o problema da página de pré-cadastros
 * Esta implementação garante que a página seja renderizada corretamente
 */
export function setupPreCadastrosFixRoutes(app: express.Express) {
  console.log('Configurando solução fixa para a página de pré-cadastros');
  
  // Rota direta para a página de pré-cadastros
  app.get('/pre-cadastros', (req, res) => {
    // Enviando o arquivo HTML diretamente
    res.sendFile(path.join(process.cwd(), 'public/pre-cadastros.html'));
  });
  
  // Rota alternativa para a mesma página
  app.get('/pre-cadastros-alt', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public/pre-cadastros.html'));
  });
  
  console.log('Rotas fixas para pré-cadastros configuradas com sucesso');
}