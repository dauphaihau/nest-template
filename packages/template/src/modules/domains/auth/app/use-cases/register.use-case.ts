import { ConflictException, Injectable } from '@nestjs/common';
import {
  AuthResponse,
  RegisterUserInput,
  RequestMetadata,
} from '../auth.types';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { Email } from '../../domain/value-objects/email';
import { PasswordHash } from '../../domain/value-objects/password-hash';
import { RoleKey } from '../../domain/value-objects/role-key';
import { PasswordHasher } from '../ports/password-hasher';
import { AuthUserRepository } from '../ports/auth-user.repository';
import { IssueSessionUseCase } from './shared/issue-session.use-case';

const defaultRole = {
  key: RoleKey.create('member'),
  name: 'Member',
  description: 'Default application member role',
} as const;

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly authUserRepository: AuthUserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly issueSessionUseCase: IssueSessionUseCase,
  ) {}

  async execute(
    input: RegisterUserInput,
    metadata: RequestMetadata,
  ): Promise<AuthResponse> {
    const email = Email.create(input.email);
    const existingUser = await this.authUserRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    await this.authUserRepository.ensureRole(defaultRole);

    const user = await this.authUserRepository.create({
      email,
      displayName: input.displayName?.trim() || undefined,
      status: UserStatus.ACTIVE,
      passwordHash: PasswordHash.fromPersisted(
        await this.passwordHasher.hash(input.password),
      ),
      passwordUpdatedAt: new Date(),
    });

    await this.authUserRepository.assignRole(user.id, defaultRole.key);

    return this.issueSessionUseCase.execute(user.id, metadata);
  }
}
