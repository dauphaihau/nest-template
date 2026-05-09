import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../../../../../common/events/user-created.event';
import type { AuthenticatedUser } from '../../../auth/app/auth.types';
import { AuthUserRepository } from '../../../auth/app/ports/auth-user.repository';
import { PasswordHasher } from '../../../auth/app/ports/password-hasher';
import { UserStatus } from '../../../auth/domain/enums/user-status.enum';
import { Email } from '../../../auth/domain/value-objects/email';
import { PasswordHash } from '../../../auth/domain/value-objects/password-hash';
import { RoleKey } from '../../../auth/domain/value-objects/role-key';
import type { UserSummary } from '../user.types';

const defaultRole = {
  key: RoleKey.create('member'),
  name: 'Member',
  description: 'Default application member role',
} as const;

export interface CreateUserInput {
  email: string;
  password: string;
  displayName?: string;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly authUserRepository: AuthUserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    actor: AuthenticatedUser,
    input: CreateUserInput,
  ): Promise<UserSummary> {
    if (!actor.roles.includes('admin')) {
      throw new ForbiddenException('Only admins can create users');
    }

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

    this.eventEmitter.emit(
      'user.created',
      new UserCreatedEvent(user.id, user.email.toString(), user.displayName),
    );

    return {
      id: user.id,
      email: user.email.toString(),
      displayName: user.displayName,
      status: user.status,
    };
  }
}
