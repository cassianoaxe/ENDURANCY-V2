// @ts-check
import express from "express";
const router = express.Router();

// Rota de teste para retornar solicitações de plano
router.get("/test-plan-requests", (req, res) => {
  // Dados estáticos das solicitações
  const staticData = {
    success: true,
    totalRequests: 1,
    requests: [
      {
        id: 1,
        name: "abrace",
        type: "Associação",
        email: "cassianoaxe@gmail.com",
        status: "pending_plan_change",
        currentPlanId: null,
        requestedPlanId: 6,
        requestDate: "2025-04-03T01:19:50.670Z",
        currentPlanName: "Free",
        requestedPlanName: "Grow"
      }
    ]
  };
  
  // Forçar tipo de conteúdo para JSON
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(staticData);
});

// Exporta como ES Modules
export default router;