import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../entities/user.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, AuditLog]),
    PermissionsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          console.warn('⚠️ JWT_SECRET não configurado, usando chave padrão (NÃO SEGURO PARA PRODUÇÃO)');
        }
        return {
          secret: secret || 'your-secret-key-change-this-in-production',
          signOptions: { 
            expiresIn: '24h',
            issuer: 'cms-api',
            audience: 'cms-users'
          },
          verifyOptions: {
            issuer: 'cms-api',
            audience: 'cms-users'
          }
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {} 