import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  ParseIntPipe, 
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException
} from '@nestjs/common';
import { UsersService, UserResponseDto } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { UserRole } from '../entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('test')
  @Public()
  async test() {
    return { message: 'Endpoint de teste funcionando', timestamp: new Date().toISOString() };
  }

  @Get()
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @RequirePermissions('users:read')
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @RequirePermissions('users:read')
  async getStats() {
    return this.usersService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @RequirePermissions('users:read')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @RequirePermissions('users:write')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @RequirePermissions('users:write')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    // Não permitir que o usuário atual mude seu próprio papel para não-admin
    if (id === currentUser.id && updateUserDto.role && updateUserDto.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Não é possível alterar seu próprio papel de administrador');
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @RequirePermissions('users:write')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    // Não permitir que o usuário atual se remova
    if (id === currentUser.id) {
      throw new ForbiddenException('Não é possível remover sua própria conta');
    }

    return this.usersService.remove(id);
  }

  @Put(':id/toggle-active')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @RequirePermissions('users:write')
  async toggleActive(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    // Não permitir que o usuário atual se desative
    if (id === currentUser.id) {
      throw new ForbiddenException('Não é possível desativar sua própria conta');
    }

    return this.usersService.toggleActive(id);
  }
} 