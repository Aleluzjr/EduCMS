import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PermissionsService } from '../permissions/permissions.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../entities/user.entity';
import { User } from '../entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const permissionsService = app.get(PermissionsService);
    const usersService = app.get(UsersService);

    console.log('🚀 Configurando permissões padrão para usuários existentes...');

    // Obter todos os usuários
    const users = await usersService.findAll();
    
    for (const userResponse of users) {
      // Buscar usuário completo com relacionamentos
      const user = await usersService.findOne(userResponse.id);
      if (!user) continue;
      
      console.log(`📝 Configurando permissões para usuário: ${user.name} (${user.email})`);
      
      // Criar objeto User com role para gerar permissões
      const userForPermissions: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        active: user.active,
        lastLoginAt: user.lastLoginAt || new Date(),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        documents: [],
        createdTemplates: [],
        apiTokens: [],
        auditLogs: [],
        permissions: []
      };
      
      // Gerar permissões padrão baseadas no role
      const defaultPermissions = await permissionsService.generateDefaultPermissions(userForPermissions);
      
      // Atualizar usuário com as permissões
      await permissionsService.updateUserPermissions(user.id, 
        defaultPermissions.map(p => `${p.resource}:${p.action}`)
      );
      
      console.log(`✅ Permissões configuradas para ${user.name}`);
    }

    console.log('🎉 Configuração de permissões concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao configurar permissões:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
