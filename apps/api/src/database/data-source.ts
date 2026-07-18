import 'dotenv/config';
import { DataSource } from 'typeorm';
import { createDatabaseOptions } from './database.config';

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error('DATABASE_URL deve estar definida para executar migrations.');
}

export default new DataSource(createDatabaseOptions(databaseUrl));
