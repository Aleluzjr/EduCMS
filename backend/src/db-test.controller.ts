import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Controller('api/db-test')
export class DbTestController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  async testConnection() {
    try {
      await this.connection.query('SELECT 1');
      return { status: 'ok', message: 'Conexão com o banco de dados bem-sucedida!' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}
