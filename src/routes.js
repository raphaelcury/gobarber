import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import UserController from './app/controllers/UserController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';

import authMiddleware from './app/middlewares/auth';
import providerMiddleware from './app/middlewares/provider';

const routes = new Router();
const upload = multer(multerConfig);

// Rotas sem autenticacao
routes.post('/sessions', SessionController.store);
routes.post('/users', UserController.store);

// A partir daqui o middleware de autenticação se aplica
routes.use(authMiddleware);
routes.put('/users', UserController.update);
routes.get('/providers', ProviderController.index);
routes.post('/appointments', AppointmentController.store);
routes.get('/appointments', AppointmentController.index);

// Rotas específicas de providers (provider === true)
routes.use(providerMiddleware);
routes.get('/schedule', ScheduleController.index);
routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

// Rota de upload de arquivos que usa o multer: upload.single
routes.post('/files', upload.single('file'), FileController.store);

export default routes;
