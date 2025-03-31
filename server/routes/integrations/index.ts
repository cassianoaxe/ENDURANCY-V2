import { Router } from "express";
import melhorEnvioRouter from "./logistica/melhor-envio";
import zoopRouter from "./zoop";
import kentroRouter from "./crm/kentro";

const integrationsRouter = Router();

// Registrar rotas de integrações de logística
integrationsRouter.use("/logistica/melhor-envio", melhorEnvioRouter);

// Registrar rotas de integrações de pagamento
integrationsRouter.use("/pagamentos/zoop", zoopRouter);

// Registrar rotas de integrações de CRM
integrationsRouter.use("/crm/kentro", kentroRouter);

export default integrationsRouter;