import { Router } from "express";
import melhorEnvioRouter from "./logistica/melhor-envio";
import zoopRouter from "./zoop";

const integrationsRouter = Router();

// Registrar rotas de integrações de logística
integrationsRouter.use("/logistica/melhor-envio", melhorEnvioRouter);

// Registrar rotas de integrações de pagamento
integrationsRouter.use("/pagamentos/zoop", zoopRouter);

export default integrationsRouter;