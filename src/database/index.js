import Sequelize from 'sequelize';
import mongoose from 'mongoose';

import User from '../app/models/User';
import File from '../app/models/File';
import Appointment from '../app/models/Appointment';

import databaseConfig from '../config/database';
import mongoConfig from '../config/mongo';

const models = [User, File, Appointment];

class Database {
  constructor() {
    this.initSql();
    this.initMongo();
  }

  initSql() {
    this.sqlConnection = new Sequelize(databaseConfig);
    models
      .map(model => model.init(this.sqlConnection))
      .map(
        model => model.associate && model.associate(this.sqlConnection.models)
      );
  }

  initMongo() {
    this.mongoConnection = mongoose.connect(
      mongoConfig.url,
      mongoConfig.options
    );
  }
}

export default new Database();
