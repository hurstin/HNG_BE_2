import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

import { Sequelize } from 'sequelize';
import { v7 as uuidv7 } from 'uuid';

const rawUri = process.env.SERVICE_URI || process.env.DATABASE_URL;
if (!rawUri) {
  console.error('\x1b[31m[Database]\x1b[0m ✘ Missing database connection URI! Please set SERVICE_URI or DATABASE_URL.');
  process.exit(1);
}

const uri = rawUri.split('?')[0];
const sequelize = new Sequelize(uri, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 2,           // Very strict connection limits for serverless compatibility safely
    min: 0,
    acquire: 60000,   // Wait longer natively if pooling gets loaded 
    idle: 10000
  }
});

import definePersonModel from './model/person.js';
const Person = definePersonModel(sequelize);

export const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('\x1b[35m[Database]\x1b[0m \x1b[32m✔\x1b[0m Sequelize connected to PostgreSQL');
    
    await sequelize.sync();
    console.log('\x1b[35m[Database]\x1b[0m \x1b[32m✔\x1b[0m Models synchronized');
  } catch (err) {
    console.error('\n\x1b[31m[Database]\x1b[0m ✘ Sequelize connection error:', err.stack, '\n');
    process.exit(1);
  }
};

export { sequelize, Person, uuidv7 };
