import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import ProviderController from './app/controllers/ProviderController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// Rotas sem autenticacao
routes.post('/sessions', SessionController.store);
routes.post('/users', UserController.store);

// A partir daqui o middleware de autenticação se aplica
routes.use(authMiddleware);
routes.put('/users', UserController.update);
routes.get('/providers', ProviderController.index);

// Rota de upload de arquivos usa o multer
routes.post('/files', upload.single('file'), FileController.store);

export default routes;
