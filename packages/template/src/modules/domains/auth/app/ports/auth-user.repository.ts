import type { UserStatus } from '../../domain/enums/user-status.enum';
import type { RoleDefinition } from '../../domain/models/role-definition';
import type { UserAccount } from '../../domain/models/user-account';
import type { Email } from '../../domain/value-objects/email';
import type { PasswordHash } from '../../domain/value-objects/password-hash';
import type { RoleKey } from '../../domain/value-objects/role-key';

export interface CreateUserAccountInput {
  email: Email;
  displayName?: string;
  status: UserStatus;
  passwordHash: PasswordHash;
  passwordUpdatedAt: Date;
  emailVerifiedAt?: Date;
}

export abstract class AuthUserRepository {
  abstract findByEmail(email: Email): Promise<UserAccount | null>;
  abstract findById(id: string): Promise<UserAccount | null>;
  abstract create(input: CreateUserAccountInput): Promise<UserAccount>;
  abstract assignRole(userId: string, roleKey: RoleKey): Promise<void>;
  abstract ensureRole(role: RoleDefinition): Promise<void>;
}
