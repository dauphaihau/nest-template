import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/api/guard/jwt-auth.guard';
import { PermissionsGuard } from '../../../auth/api/guard/permissions.guard';
import { GetUserByIdUseCase } from '../../app/use-cases/get-user-by-id.use-case';
import { ListUsersUseCase } from '../../app/use-cases/list-users.use-case';
import type { UserSummary } from '../../app/user.types';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserController {
  constructor(
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
  ) {}

  @Get()
  users(): Promise<UserSummary[]> {
    return this.listUsersUseCase.execute();
  }

  @Get(':id')
  async user(@Param('id') id: string): Promise<UserSummary> {
    const user = await this.getUserByIdUseCase.execute(id);

    if (!user) {
      throw new NotFoundException('User was not found');
    }

    return user;
  }
}
