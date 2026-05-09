import { UseGuards } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../../../auth/api/guard/jwt-auth.guard';
import { GetUserByIdUseCase } from '../../app/use-cases/get-user-by-id.use-case';
import { ListUsersUseCase } from '../../app/use-cases/list-users.use-case';
import { UserType } from './dto/user.type';

@Resolver(() => UserType)
@UseGuards(JwtAuthGuard)
export class UserResolver {
  constructor(
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
  ) {}

  @Query(() => [UserType], { name: 'users' })
  users() {
    return this.listUsersUseCase.execute();
  }

  @Query(() => UserType, { name: 'user', nullable: true })
  user(@Args('id', { type: () => ID }) id: string) {
    return this.getUserByIdUseCase.execute(id);
  }
}
