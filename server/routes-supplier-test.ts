import express from 'express';

// Criar um novo router para testes
const router = express.Router();

// Rota para teste básico sem banco de dados - apenas retorna dados estáticos
router.get("/hello", (req, res) => {
  res.json({
    success: true,
    message: "API de teste de fornecedores funcionando",
    timestamp: new Date().toISOString(),
    data: {
      id: 1,
      name: "Teste Diagnóstico",
      version: "1.0.0"
    }
  });
});

export function registerSupplierTestRoutes(app: express.Express) {
  app.use("/api/supplier-test", router);
  console.log("Rotas de teste para fornecedores registradas com sucesso");
}