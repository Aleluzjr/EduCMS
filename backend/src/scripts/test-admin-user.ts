import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { PermissionsService } from '../permissions/permissions.service';
import { AuthService } from '../auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const usersService = app.get(UsersService);
    const permissionsService = app.get(PermissionsService);
    const authService = app.get(AuthService);

    console.log('🔍 Verificando usuário admin...');

    // Buscar todos os usuários
    const users = await usersService.findAll();
    console.log(`📊 Total de usuários encontrados: ${users.length}`);
    
    for (const user of users) {
      console.log(`👤 Usuário: ${user.name} (${user.email}) - Role: ${user.role} - Ativo: ${user.active}`);
      
      if (user.role === 'ADMIN') {
        console.log('👑 Usuário ADMIN encontrado!');
        
        // Verificar permissões
        const permissions = await permissionsService.getUserPermissions(user.id);
        console.log(`🔑 Permissões do admin:`, permissions);
        
        // Testar refresh token
        try {
          // Simular um refresh token (isso é apenas para teste)
          console.log('🔄 Testando serviço de permissões...');
          const userPermissions = await authService.getUserPermissions(user.id);
          console.log(`✅ Permissões obtidas via AuthService:`, userPermissions);
        } catch (error) {
          console.error('❌ Erro ao obter permissões via AuthService:', error.message);
        }
      }
    }

    if (users.length === 0) {
      console.log('⚠️ Nenhum usuário encontrado no sistema');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
