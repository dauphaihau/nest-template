import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import {
  AuthSessionRepository,
  CreateUserSessionInput,
} from '../../app/ports/auth-session.repository';
import type { UserSession } from '../../domain/models/user-session';
import { CurrentUserEntity } from './entities/current-user.entity';
import { UserSessionEntity } from './entities/user-session.entity';

@Injectable()
export class MikroOrmAuthSessionRepository implements AuthSessionRepository {
  constructor(
    private readonly entityManager: EntityManager,
    @InjectRepository(UserSessionEntity)
    private readonly sessionRepository: EntityRepository<UserSessionEntity>,
    @InjectRepository(CurrentUserEntity)
    private readonly userRepository: EntityRepository<CurrentUserEntity>,
  ) {}

  async findById(id: string): Promise<UserSession | null> {
    const session = await this.sessionRepository.findOne(
      { id },
      { populate: ['user'] },
    );

    return session ? this.toUserSession(session) : null;
  }

  async create(input: CreateUserSessionInput): Promise<UserSession> {
    const user = await this.userRepository.findOneOrFail({ id: input.userId });
    const session = this.sessionRepository.create({
      user,
      refreshTokenHash: input.refreshTokenHash,
      expiresAt: input.expiresAt,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    });

    await this.entityManager.persistAndFlush(session);

    return this.toUserSession(session);
  }

  async save(session: UserSession): Promise<void> {
    const existingSession = await this.sessionRepository.findOneOrFail({
      id: session.id,
    });

    existingSession.refreshTokenHash = session.refreshTokenHash;
    existingSession.expiresAt = session.expiresAt;
    existingSession.revokedAt = session.revokedAt;
    existingSession.userAgent = session.userAgent;
    existingSession.ipAddress = session.ipAddress;

    await this.entityManager.flush();
  }

  private toUserSession(session: UserSessionEntity): UserSession {
    return {
      id: session.id,
      userId: session.user.id,
      refreshTokenHash: session.refreshTokenHash,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
    };
  }
}
