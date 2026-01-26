import { Router } from 'express';

import { getHealthCheck } from './system.controller';

const systemRoutes = Router();

systemRoutes.get('/health', getHealthCheck);

export default systemRoutes;
