
import { Router } from 'express';
import { authenticate } from '../auth-middleware';
import * as controllers from './controllers';

const router = Router();

// Rotas públicas
router.get('/health', controllers.healthCheck);

// Rotas protegidas
router.use('/api', authenticate);
router.use('/api/organizations', controllers.organizationRoutes);
router.use('/api/modules', controllers.moduleRoutes);
router.use('/api/integrations', controllers.integrationRoutes);
router.use('/api/laboratory', controllers.laboratoryRoutes);
router.use('/api/affiliates', controllers.affiliateRoutes);

export default router;
