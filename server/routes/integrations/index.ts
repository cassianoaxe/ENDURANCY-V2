import { Router } from "express";
import melhorEnvioRouter from "./logistica/melhor-envio";

const integrationsRouter = Router();

// Registrar rotas de integrações de logística
integrationsRouter.use("/logistica/melhor-envio", melhorEnvioRouter);

export default integrationsRouter;