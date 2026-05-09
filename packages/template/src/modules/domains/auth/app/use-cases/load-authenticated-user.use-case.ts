import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedUser } from '../auth.types';
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
      throw new UnauthorizedException('Session is not active');
    }

    const user = await this.authUserRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User was not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('User account is not active');
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
