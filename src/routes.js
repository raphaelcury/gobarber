import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

// Rotas sem autenticacao
routes.post('/sessions', SessionController.store);
routes.post('/users', UserController.store);

// A partir daqui o middleware de autenticação se aplica
routes.use(authMiddleware);
routes.put('/users', UserController.update);

export default routes;
