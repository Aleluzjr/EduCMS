import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuditLog, AuditAction, AuditEntity } from '../entities/audit-log.entity';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private jwtService: JwtService,
    private permissionsService: PermissionsService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ 
      where: { email, active: true },
      select: ['id', 'email', 'password', 'role', 'name', 'active']
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto, ip: string, userAgent: string): Promise<any> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Atualizar último login
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    // Obter permissões do usuário
    const permissions = await this.permissionsService.getUserPermissions(user.id);

    // Gerar tokens
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      permissions 
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '24h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    // Registrar auditoria
    await this.createAuditLog({
      userId: user.id,
      action: AuditAction.LOGIN,
      entity: AuditEntity.AUTH,
      ip,
      userAgent,
      metadata: JSON.stringify({ email: user.email })
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions
      }
    };
  }

  async register(registerDto: RegisterDto, ip: string, userAgent: string): Promise<any> {
    // Verificar se o email já existe
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email }
    });

    if (existingUser) {
      throw new BadRequestException('Email já está em uso');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Criar usuário - sempre com role EDITOR para novos registros
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: UserRole.EDITOR // Forçar role EDITOR para novos registros
    });

    const savedUser = await this.userRepository.save(user);

    // Registrar auditoria
    await this.createAuditLog({
      userId: savedUser.id,
      action: AuditAction.CREATE,
      entity: AuditEntity.USER,
      entityId: savedUser.id,
      ip,
      userAgent,
      metadata: JSON.stringify({ email: savedUser.email, role: savedUser.role })
    });

    const { password, ...result } = savedUser;
    return result;
  }

  async setupAdmin(registerDto: RegisterDto, ip: string, userAgent: string): Promise<any> {
    // Verificar se já existem usuários no sistema
    const userCount = await this.userRepository.count();
    
    if (userCount > 0) {
      throw new BadRequestException('Sistema já foi configurado. Use o endpoint de registro normal.');
    }

    // Verificar se o email já existe
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email }
    });

    if (existingUser) {
      throw new BadRequestException('Email já está em uso');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Criar usuário ADMIN (primeiro usuário do sistema)
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: UserRole.ADMIN // Primeiro usuário será ADMIN
    });

    const savedUser = await this.userRepository.save(user);

    // Registrar auditoria
    await this.createAuditLog({
      userId: savedUser.id,
      action: AuditAction.CREATE,
      entity: AuditEntity.USER,
      entityId: savedUser.id,
      ip,
      userAgent,
      metadata: JSON.stringify({ email: savedUser.email, role: savedUser.role, isFirstUser: true })
    });

    const { password, ...result } = savedUser;
    return result;
  }

  async refreshToken(refreshToken: string): Promise<any> {
    try {
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token não fornecido');
      }

      // Log para debug em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Refresh token solicitado para:', refreshToken.substring(0, 20) + '...');
      }

      const payload = this.jwtService.verify(refreshToken);
      
      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Payload do token inválido');
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('📋 Payload decodificado:', { sub: payload.sub, email: payload.email, role: payload.role });
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.sub, active: true }
      });

      if (!user) {
        if (process.env.NODE_ENV === 'development') {
          console.log('❌ Usuário não encontrado ou inativo:', payload.sub);
        }
        throw new UnauthorizedException('Usuário não encontrado ou inativo');
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Usuário encontrado:', { id: user.id, email: user.email, role: user.role, active: user.active });
      }

      // Obter permissões do usuário
      const permissions = await this.permissionsService.getUserPermissions(user.id);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔑 Permissões obtidas:', permissions);
      }

      const newPayload = { 
        email: user.email, 
        sub: user.id, 
        role: user.role,
        permissions 
      };
      
      const newAccessToken = this.jwtService.sign(newPayload, { 
        expiresIn: '24h',
        issuer: 'cms-api',
        audience: 'cms-users'
      });
      const newRefreshToken = this.jwtService.sign(newPayload, { 
        expiresIn: '30d',
        issuer: 'cms-api',
        audience: 'cms-users'
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Refresh bem-sucedido para usuário:', user.email);
        console.log('🆕 Novos tokens gerados - Access:', newAccessToken.substring(0, 20) + '...', 'Refresh:', newRefreshToken.substring(0, 20) + '...');
      }

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions
        }
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Erro no refresh:', error.message);
        console.log('❌ Tipo do erro:', error.name);
        console.log('❌ Stack trace:', error.stack);
      }
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      // Se for erro de JWT (expired, invalid, etc)
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token inválido ou expirado');
      }
      
      throw new UnauthorizedException('Erro interno na validação do token');
    }
  }

  async logout(userId: number, ip: string, userAgent: string): Promise<void> {
    // Registrar auditoria
    await this.createAuditLog({
      userId,
      action: AuditAction.LOGOUT,
      entity: AuditEntity.AUTH,
      ip,
      userAgent,
      metadata: JSON.stringify({ action: 'logout' })
    });
  }

  private async createAuditLog(auditData: Partial<AuditLog>): Promise<void> {
    const auditLog = this.auditLogRepository.create(auditData);
    await this.auditLogRepository.save(auditLog);
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id, active: true } });
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    return this.permissionsService.getUserPermissions(userId);
  }
} 