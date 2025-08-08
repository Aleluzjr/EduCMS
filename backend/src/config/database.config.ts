import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'cms',
  autoLoadEntities: true,
  synchronize: process.env.NODE_ENV !== 'production', // Só sincroniza em desenvolvimento
  logging: process.env.NODE_ENV === 'development',
}; 