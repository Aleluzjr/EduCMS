import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { PermissionsService } from '../../permissions/permissions.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private permissionsService: PermissionsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-this-in-production',
      issuer: 'cms-api',
      audience: 'cms-users',
    });
  }

  async validate(payload: any) {
    // Log para debug
    if (process.env.NODE_ENV === 'development') {
      console.log('JWT Strategy - Payload recebido:', payload);
    }

    if (!payload || !payload.sub) {
      if (process.env.NODE_ENV === 'development') {
        console.log('JWT Strategy - Payload inválido ou sem sub');
      }
      throw new UnauthorizedException('Token inválido');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub, active: true },
      select: ['id', 'email', 'role', 'name', 'active']
    });

    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('JWT Strategy - Usuário não encontrado ou inativo:', payload.sub);
      }
      throw new UnauthorizedException('Usuário não encontrado ou inativo');
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('JWT Strategy - Usuário validado com sucesso:', user.id);
    }

    // Obter permissões do usuário
    const permissions = await this.permissionsService.getUserPermissions(user.id);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      active: user.active,
      permissions
    };
  }
} 