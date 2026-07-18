import { join } from 'node:path';
import { DataSourceOptions } from 'typeorm';
import { User } from '../users/entities/user.entity';

export function createDatabaseOptions(
  databaseUrl: string,
): DataSourceOptions {
  return {
    type: 'postgres',
    url: databaseUrl,
    entities: [User],
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
    synchronize: false,
    migrationsRun: false,
  };
}
