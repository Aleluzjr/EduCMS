import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Configuração de CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  
  // Configuração global de validação com configurações mais específicas
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false, // Permite parâmetros não declarados
    transform: true,
    transformOptions: {
      enableImplicitConversion: true, // Permite conversão implícita
    },
    skipMissingProperties: true, // Pula propriedades ausentes
  }));
  
  // Configuração para servir arquivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  // Log seguro apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log(`Aplicação rodando na porta ${port}`);
  }
}
bootstrap();
