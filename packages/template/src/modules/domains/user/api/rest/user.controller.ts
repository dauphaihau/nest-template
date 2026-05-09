import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../auth/api/rest/current-user.decorator';
import { RequirePermissions } from '../../../auth/api/rest/require-permissions.decorator';
import type { AuthenticatedUser } from '../../../auth/app/auth.types';
import { JwtAuthGuard } from '../../../auth/api/guard/jwt-auth.guard';
import { PermissionsGuard } from '../../../auth/api/guard/permissions.guard';
import { CreateUserUseCase } from '../../app/use-cases/create-user.use-case';
import { GetUserByIdUseCase } from '../../app/use-cases/get-user-by-id.use-case';
import { ListUsersUseCase } from '../../app/use-cases/list-users.use-case';
import type { UserSummary } from '../../app/user.types';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
  ) {}

  @Get()
  @RequirePermissions('users.read')
  users(): Promise<UserSummary[]> {
    return this.listUsersUseCase.execute();
  }

  @Get(':id')
  @RequirePermissions('users.read')
  async user(@Param('id') id: string): Promise<UserSummary> {
    const user = await this.getUserByIdUseCase.execute(id);

    if (!user) {
      throw new NotFoundException('User was not found');
    }

    return user;
  }

  @Post()
  @RequirePermissions('users.manage')
  createUser(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() body: CreateUserDto,
  ): Promise<UserSummary> {
    return this.createUserUseCase.execute(currentUser, body);
  }
}
