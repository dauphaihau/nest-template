import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTH_CONFIG } from '../../../../config/auth.config';
import type { AuthConfig } from '../../../../config/auth.config';
import { LoadAuthenticatedUserUseCase } from '../app/use-cases/load-authenticated-user.use-case';
import { AccessTokenPayload, AuthenticatedUser } from '../app/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(AUTH_CONFIG) authConfig: AuthConfig,
    private readonly loadAuthenticatedUserUseCase: LoadAuthenticatedUserUseCase,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.jwtAccessSecret,
    });
  }

  async validate(payload: AccessTokenPayload): Promise<AuthenticatedUser> {
    return this.loadAuthenticatedUserUseCase.execute(
      payload.sub,
      payload.sessionId,
    );
  }
}
