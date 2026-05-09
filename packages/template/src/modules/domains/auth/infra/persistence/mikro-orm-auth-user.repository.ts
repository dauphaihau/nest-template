import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import {
  AuthUserRepository,
  CreateUserAccountInput,
} from '../../app/ports/auth-user.repository';
import type { RoleDefinition } from '../../domain/models/role-definition';
import type { UserAccount } from '../../domain/models/user-account';
import { Email } from '../../domain/value-objects/email';
import { PasswordHash } from '../../domain/value-objects/password-hash';
import { PermissionKey } from '../../domain/value-objects/permission-key';
import { RoleKey } from '../../domain/value-objects/role-key';
import { CurrentUserCredentialEntity } from './entities/current-user-credential.entity';
import { CurrentUserEntity } from './entities/current-user.entity';
import { RoleEntity } from './entities/role.entity';
import { UserRoleEntity } from './entities/user-role.entity';

@Injectable()
export class MikroOrmAuthUserRepository implements AuthUserRepository {
  constructor(
    private readonly entityManager: EntityManager,
    @InjectRepository(CurrentUserEntity)
    private readonly userRepository: EntityRepository<CurrentUserEntity>,
    @InjectRepository(CurrentUserCredentialEntity)
    private readonly credentialRepository: EntityRepository<CurrentUserCredentialEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: EntityRepository<RoleEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: EntityRepository<UserRoleEntity>,
  ) {}

  async findByEmail(email: Email): Promise<UserAccount | null> {
    const user = await this.userRepository.findOne(
      { email: email.toString() },
      { populate: ['credential', 'userRoles.role.rolePermissions.permission'] },
    );

    return user ? this.toUserAccount(user) : null;
  }

  async findById(id: string): Promise<UserAccount | null> {
    const user = await this.userRepository.findOne(
      { id },
      { populate: ['credential', 'userRoles.role.rolePermissions.permission'] },
    );

    return user ? this.toUserAccount(user) : null;
  }

  async create(input: CreateUserAccountInput): Promise<UserAccount> {
    const user = this.userRepository.create({
      email: input.email.toString(),
      displayName: input.displayName,
      status: input.status,
      emailVerifiedAt: input.emailVerifiedAt,
    });
    const credential = this.credentialRepository.create({
      user,
      passwordHash: input.passwordHash.toString(),
      passwordUpdatedAt: input.passwordUpdatedAt,
    });

    user.credential = credential;

    await this.entityManager.persistAndFlush([user, credential]);

    return this.toUserAccount(user);
  }

  async assignRole(userId: string, roleKey: RoleKey): Promise<void> {
    const user = await this.userRepository.findOneOrFail({ id: userId });
    const role = await this.roleRepository.findOneOrFail({
      key: roleKey.toString(),
    });
    const existingUserRole = await this.userRoleRepository.findOne({
      user,
      role,
    });

    if (existingUserRole) {
      return;
    }

    const userRole = this.userRoleRepository.create({
      user,
      role,
      assignedAt: new Date(),
    });

    await this.entityManager.persistAndFlush(userRole);
  }

  async ensureRole(roleDefinition: RoleDefinition): Promise<void> {
    const existingRole = await this.roleRepository.findOne({
      key: roleDefinition.key.toString(),
    });

    if (existingRole) {
      return;
    }

    const role = this.roleRepository.create({
      key: roleDefinition.key.toString(),
      name: roleDefinition.name,
      description: roleDefinition.description,
    });
    await this.entityManager.persistAndFlush(role);
  }

  private toUserAccount(user: CurrentUserEntity): UserAccount {
    const roles = user.userRoles
      .getItems()
      .map((userRole) => RoleKey.create(userRole.role.key))
      .sort((left, right) => left.toString().localeCompare(right.toString()));
    const permissions = Array.from(
      new Map(
        user.userRoles.getItems().flatMap((userRole) =>
          userRole.role.rolePermissions.getItems().map((rolePermission) => {
            const key = PermissionKey.create(rolePermission.permission.key);
            return [key.toString(), key] as const;
          }),
        ),
      ).values(),
    ).sort((left, right) => left.toString().localeCompare(right.toString()));

    return {
      id: user.id,
      email: Email.create(user.email),
      displayName: user.displayName,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
      passwordHash: user.credential
        ? PasswordHash.fromPersisted(user.credential.passwordHash)
        : undefined,
      passwordUpdatedAt: user.credential?.passwordUpdatedAt,
      roles,
      permissions,
    };
  }
}
