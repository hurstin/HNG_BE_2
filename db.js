import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

import { Sequelize } from 'sequelize';
import { v7 as uuidv7 } from 'uuid';

const uri = process.env.SERVICE_URI ? process.env.SERVICE_URI.split('?')[0] : '';
const sequelize = new Sequelize(uri, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

import definePersonModel from './model/person.js';
const Person = definePersonModel(sequelize);

export const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('\x1b[35m[Database]\x1b[0m \x1b[32m✔\x1b[0m Sequelize connected to PostgreSQL');
    
    await sequelize.sync({ alter: true });
    console.log('\x1b[35m[Database]\x1b[0m \x1b[32m✔\x1b[0m Models synchronized');
  } catch (err) {
    console.error('\n\x1b[31m[Database]\x1b[0m ✘ Sequelize connection error:', err.stack, '\n');
    process.exit(1);
  }
};

export { sequelize, Person, uuidv7 };
