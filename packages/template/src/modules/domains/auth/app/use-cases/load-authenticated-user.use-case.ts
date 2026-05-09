import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../auth.types';
import {
  InactiveUserError,
  SessionNotActiveError,
  UserNotFoundError,
} from '../errors/auth-app.error';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { AuthSessionRepository } from '../ports/auth-session.repository';
import { AuthUserRepository } from '../ports/auth-user.repository';

@Injectable()
export class LoadAuthenticatedUserUseCase {
  constructor(
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly authUserRepository: AuthUserRepository,
  ) {}

  async execute(userId: string, sessionId: string): Promise<AuthenticatedUser> {
    const session = await this.authSessionRepository.findById(sessionId);

    if (
      !session ||
      session.userId !== userId ||
      session.revokedAt ||
      session.expiresAt <= new Date()
    ) {
      throw new SessionNotActiveError();
    }

    const user = await this.authUserRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new InactiveUserError();
    }

    return {
      userId: user.id,
      email: user.email.toString(),
      displayName: user.displayName,
      status: user.status,
      sessionId: session.id,
      roles: user.roles.map((role) => role.toString()),
      permissions: user.permissions.map((permission) => permission.toString()),
    };
  }
}
