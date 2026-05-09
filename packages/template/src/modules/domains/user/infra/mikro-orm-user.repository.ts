import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { CurrentUserEntity } from '../../auth/infra/persistence/entities/current-user.entity';
import { UserRepository } from '../app/ports/user.repository';
import { UserSummary } from '../app/user.types';

@Injectable()
export class MikroOrmUserRepository implements UserRepository {
  constructor(private readonly entityManager: EntityManager) {}

  async findAll(): Promise<UserSummary[]> {
    const userRepository = this.entityManager.fork().getRepository(CurrentUserEntity);
    const users = await userRepository.findAll({
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => this.toSummary(user));
  }

  async findById(id: string): Promise<UserSummary | null> {
    const userRepository = this.entityManager.fork().getRepository(CurrentUserEntity);
    const user = await userRepository.findOne({ id });

    return user ? this.toSummary(user) : null;
  }

  private toSummary(user: CurrentUserEntity): UserSummary {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      status: user.status,
    };
  }
}
