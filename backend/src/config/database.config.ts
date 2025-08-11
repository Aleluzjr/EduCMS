import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get<string>('DB_HOST') || 'localhost',
  port: parseInt(configService.get<string>('DB_PORT') || '3306'),
  username: configService.get<string>('DB_USER') || 'root',
  password: configService.get<string>('DB_PASS') || '',
  database: configService.get<string>('DB_NAME') || 'cms',
  entities: [
    'dist/**/*.entity{.ts,.js}',
  ],
  autoLoadEntities: true,
  synchronize: configService.get<string>('NODE_ENV') !== 'production', // Só sincroniza em desenvolvimento
  logging: configService.get<string>('NODE_ENV') === 'development',
}); 