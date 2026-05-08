import { Injectable } from '@nestjs/common';
import {
  AuthResponse,
  AuthenticatedUser,
  LoginUserInput,
  RegisterUserInput,
  RequestMetadata,
  UserProfile,
} from './auth.types';
import { GetCurrentUserUseCase } from './use-cases/get-current-user.use-case';
import { LoadAuthenticatedUserUseCase } from './use-cases/load-authenticated-user.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import { LogoutUseCase } from './use-cases/logout.use-case';
import { RefreshSessionUseCase } from './use-cases/refresh-session.use-case';
import { RegisterUseCase } from './use-cases/register.use-case';

@Injectable()
export class AuthService {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly loadAuthenticatedUserUseCase: LoadAuthenticatedUserUseCase,
  ) {}

  register(
    input: RegisterUserInput,
    metadata: RequestMetadata,
  ): Promise<AuthResponse> {
    return this.registerUseCase.execute(input, metadata);
  }

  login(
    input: LoginUserInput,
    metadata: RequestMetadata,
  ): Promise<AuthResponse> {
    return this.loginUseCase.execute(input, metadata);
  }

  refresh(refreshToken: string, metadata: RequestMetadata): Promise<AuthResponse> {
    return this.refreshSessionUseCase.execute(refreshToken, metadata);
  }

  logout(currentUser: AuthenticatedUser): Promise<void> {
    return this.logoutUseCase.execute(currentUser);
  }

  getCurrentUser(currentUser: AuthenticatedUser): Promise<UserProfile> {
    return this.getCurrentUserUseCase.execute(currentUser);
  }

  buildAuthenticatedUser(
    userId: string,
    sessionId: string,
  ): Promise<AuthenticatedUser> {
    return this.loadAuthenticatedUserUseCase.execute(userId, sessionId);
  }
}
