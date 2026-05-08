import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthResponse, RequestMetadata } from '../auth.types';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { AuthSessionRepository } from '../ports/auth-session.repository';
import { AuthTokenService } from '../ports/auth-token.service';
import { TokenHasher } from '../ports/token-hasher';
import { AuthUserRepository } from '../ports/auth-user.repository';
import { IssueSessionUseCase } from './shared/issue-session.use-case';

@Injectable()
export class RefreshSessionUseCase {
  constructor(
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly authTokenService: AuthTokenService,
    private readonly tokenHasher: TokenHasher,
    private readonly authUserRepository: AuthUserRepository,
    private readonly issueSessionUseCase: IssueSessionUseCase,
  ) {}

  async execute(
    refreshToken: string,
    metadata: RequestMetadata,
  ): Promise<AuthResponse> {
    const payload =
      await this.authTokenService.verifyRefreshToken(refreshToken);

    if (!payload || payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.authSessionRepository.findById(payload.sessionId);

    if (!session || session.userId !== payload.sub) {
      throw new UnauthorizedException('Refresh session was not found');
    }

    if (session.revokedAt || session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Refresh session is no longer active');
    }

    if (session.refreshTokenHash !== this.tokenHasher.hash(refreshToken)) {
      throw new UnauthorizedException('Refresh token does not match session');
    }

    const user = await this.authUserRepository.findById(session.userId);

    if (!user) {
      throw new UnauthorizedException('User was not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('User account is not active');
    }

    return this.issueSessionUseCase.execute(user.id, metadata, session);
  }
}
