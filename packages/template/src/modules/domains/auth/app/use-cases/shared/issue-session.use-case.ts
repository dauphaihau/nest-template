import { Injectable } from '@nestjs/common';
import {
  AuthResponse,
  AuthenticatedUser,
  RequestMetadata,
} from '../../auth.types';
import {
  InactiveUserError,
  UserNotFoundError,
} from '../../errors/auth-app.error';
import { UserStatus } from '../../../domain/enums/user-status.enum';
import type { UserSession } from '../../../domain/models/user-session';
import { AuthSessionRepository } from '../../ports/auth-session.repository';
import { AuthTokenService } from '../../ports/auth-token.service';
import { TokenHasher } from '../../ports/token-hasher';
import { AuthUserRepository } from '../../ports/auth-user.repository';

@Injectable()
export class IssueSessionUseCase {
  constructor(
    private readonly authUserRepository: AuthUserRepository,
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly authTokenService: AuthTokenService,
    private readonly tokenHasher: TokenHasher,
  ) {}

  async execute(
    userId: string,
    metadata: RequestMetadata,
    existingSession?: UserSession,
  ): Promise<AuthResponse> {
    const user = await this.authUserRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new InactiveUserError();
    }

    const session =
      existingSession ??
      (await this.authSessionRepository.create({
        userId: user.id,
        refreshTokenHash: '',
        expiresAt: new Date(),
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
      }));

    const authenticatedUser: AuthenticatedUser = {
      userId: user.id,
      email: user.email.toString(),
      displayName: user.displayName,
      status: user.status,
      sessionId: session.id,
      roles: user.roles.map((role) => role.toString()),
      permissions: user.permissions.map((permission) => permission.toString()),
    };

    const accessToken =
      await this.authTokenService.issueAccessToken(authenticatedUser);
    const refreshToken = await this.authTokenService.issueRefreshToken({
      userId: user.id,
      sessionId: session.id,
    });
    const decodedRefreshToken =
      await this.authTokenService.verifyRefreshToken(refreshToken);

    if (!decodedRefreshToken) {
      throw new Error('Issued refresh token could not be verified');
    }

    session.refreshTokenHash = this.tokenHasher.hash(refreshToken);
    session.expiresAt = new Date(decodedRefreshToken.exp * 1000);
    session.revokedAt = undefined;
    session.userAgent = metadata.userAgent;
    session.ipAddress = metadata.ipAddress;
    await this.authSessionRepository.save(session);

    return {
      accessToken,
      refreshToken,
      user: {
        id: authenticatedUser.userId,
        email: authenticatedUser.email,
        displayName: authenticatedUser.displayName,
        status: authenticatedUser.status,
        sessionId: authenticatedUser.sessionId,
        roles: authenticatedUser.roles,
        permissions: authenticatedUser.permissions,
      },
    };
  }
}
