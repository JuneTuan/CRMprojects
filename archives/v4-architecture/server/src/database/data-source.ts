import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

export type DatabaseType = 'json' | 'sqlite' | 'postgres';

export const getDatabaseType = (): DatabaseType => {
  const dbType = process.env.DB_TYPE || 'json';
  if (['json', 'sqlite', 'postgres'].includes(dbType)) {
    return dbType as DatabaseType;
  }
  return 'json';
};

export const getDataSourceOptions = (): DataSourceOptions | null => {
  const dbType = getDatabaseType();
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (dbType === 'json') {
    return null;
  }

  if (dbType === 'postgres') {
    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'crm_db',
      entities: ['dist/**/*.entity.js'],
      migrations: ['dist/database/migrations/*.js'],
      synchronize: isDevelopment,
      logging: isDevelopment,
    };
  }

  if (dbType === 'sqlite') {
    return {
      type: 'sqlite',
      database: process.env.DB_PATH || './data/crm.db',
      entities: ['dist/**/*.entity.js'],
      migrations: ['dist/database/migrations/*.js'],
      synchronize: isDevelopment,
      logging: isDevelopment,
    };
  }

  return null;
};
