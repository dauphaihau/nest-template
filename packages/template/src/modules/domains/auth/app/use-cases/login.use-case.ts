import { Injectable } from '@nestjs/common';
import { AuthResponse, LoginUserInput, RequestMetadata } from '../auth.types';
import {
  InactiveUserError,
  InvalidCredentialsError
} from '../errors/auth-app.error';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { Email } from '../../domain/value-objects/email';
import { PasswordHasher } from '../ports/password-hasher';
import { AuthUserRepository } from '../ports/auth-user.repository';
import { IssueSessionUseCase } from './shared/issue-session.use-case';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly authUserRepository: AuthUserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly issueSessionUseCase: IssueSessionUseCase
  ) {}

  async execute(
    input: LoginUserInput,
    metadata: RequestMetadata
  ): Promise<AuthResponse> {
    const email = Email.create(input.email);
    const user = await this.authUserRepository.findByEmail(email);

    if (!user?.passwordHash) {
      throw new InvalidCredentialsError();
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new InactiveUserError();
    }

    const passwordMatches = await this.passwordHasher.matches(
      input.password,
      user.passwordHash.toString()
    );

    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    return this.issueSessionUseCase.execute(user.id, metadata);
  }
}
