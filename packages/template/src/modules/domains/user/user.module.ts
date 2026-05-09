import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CurrentUserEntity } from '../auth/infra/persistence/entities/current-user.entity';
import { UserRepository } from './app/ports/user.repository';
import { GetUserByIdUseCase } from './app/use-cases/get-user-by-id.use-case';
import { ListUsersUseCase } from './app/use-cases/list-users.use-case';
import { UserResolver } from './api/graphql/user.resolver';
import { UserController } from './api/rest/user.controller';
import { MikroOrmUserRepository } from './infra/mikro-orm-user.repository';

@Module({
  imports: [MikroOrmModule.forFeature([CurrentUserEntity])],
  controllers: [UserController],
  providers: [
    {
      provide: UserRepository,
      useClass: MikroOrmUserRepository,
    },
    GetUserByIdUseCase,
    ListUsersUseCase,
    UserResolver,
  ],
})
export class UserModule {}
