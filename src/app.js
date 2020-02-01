import express from 'express';
import routes from './routes';

import './database'; // invoca a inicialização da conexão com o banco
// index já é pego automaticamente

class App {
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
