import { Router } from 'express';
import ticketsRouter from './tickets';

const router = Router();

router.use('/tickets', ticketsRouter);

export default router;