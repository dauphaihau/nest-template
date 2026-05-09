import { UseGuards } from '@nestjs/common';
import {
  Args, ID, Mutation, Query, Resolver 
} from '@nestjs/graphql';
import { CurrentUser } from '../../../auth/api/current-user.decorator';
import { PermissionsGuard } from '../../../auth/api/guard/permissions.guard';
import { RequirePermissions } from '../../../auth/api/require-permissions.decorator';
import type { AuthenticatedUser } from '../../../auth/app/auth.types';
import { JwtAuthGuard } from '../../../auth/api/guard/jwt-auth.guard';
import { CreateUserUseCase } from '../../app/use-cases/create-user.use-case';
import { GetUserByIdUseCase } from '../../app/use-cases/get-user-by-id.use-case';
import { ListUsersUseCase } from '../../app/use-cases/list-users.use-case';
import { CreateUserInput } from './dto/create-user.input';
import { UserType } from './dto/user.type';

@Resolver(() => UserType)
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserResolver {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase
  ) {}

  @Query(() => [UserType], { name: 'users' })
  @RequirePermissions('users.read')
  users() {
    return this.listUsersUseCase.execute();
  }

  @Query(() => UserType, { name: 'user', nullable: true })
  @RequirePermissions('users.read')
  user(@Args('id', { type: () => ID }) id: string) {
    return this.getUserByIdUseCase.execute(id);
  }

  @Mutation(() => UserType, { name: 'createUser' })
  @RequirePermissions('users.manage')
  createUser(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('input') input: CreateUserInput
  ) {
    return this.createUserUseCase.execute(currentUser, input);
  }
}
