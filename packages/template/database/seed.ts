import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/postgresql';
import { ConfigService } from '@nestjs/config';
import { buildAuthConfig } from '../src/config/auth.config';
import { CurrentUserEntity } from '../src/modules/domains/auth/infra/persistence/entities/current-user.entity';
import { CurrentUserCredentialEntity } from '../src/modules/domains/auth/infra/persistence/entities/current-user-credential.entity';
import { EmailVerificationTokenEntity } from '../src/modules/domains/auth/infra/persistence/entities/email-verification-token.entity';
import { PermissionEntity } from '../src/modules/domains/auth/infra/persistence/entities/permission.entity';
import { PasswordResetTokenEntity } from '../src/modules/domains/auth/infra/persistence/entities/password-reset-token.entity';
import { RoleEntity } from '../src/modules/domains/auth/infra/persistence/entities/role.entity';
import { RolePermissionEntity } from '../src/modules/domains/auth/infra/persistence/entities/role-permission.entity';
import { UserRoleEntity } from '../src/modules/domains/auth/infra/persistence/entities/user-role.entity';
import { UserSessionEntity } from '../src/modules/domains/auth/infra/persistence/entities/user-session.entity';
import { buildDatabaseConfig } from '../src/config/database.config';
import { UserStatus } from '../src/modules/domains/auth/domain/enums/user-status.enum';
import { BcryptPasswordHasher } from '../src/modules/domains/auth/infra/security/bcrypt-password-hasher';

const roles = [
  {
    key: 'admin',
    name: 'Administrator',
    description: 'Full system administration access',
  },
  {
    key: 'member',
    name: 'Member',
    description: 'Default application member role',
  },
] as const;

const permissions = [
  {
    key: 'auth.me.read',
    name: 'Read Current Auth Profile',
    description: 'Read the current authenticated user profile',
  },
  {
    key: 'auth.session.manage',
    name: 'Manage Auth Sessions',
    description: 'Refresh and revoke authentication sessions',
  },
  {
    key: 'users.read',
    name: 'Read Users',
    description: 'View user records',
  },
  {
    key: 'users.manage',
    name: 'Manage Users',
    description: 'Create, update, or disable users',
  },
  {
    key: 'roles.read',
    name: 'Read Roles',
    description: 'View role definitions',
  },
  {
    key: 'roles.manage',
    name: 'Manage Roles',
    description: 'Create or update roles and assignments',
  },
] as const;

const rolePermissionMap: Record<string, string[]> = {
  admin: permissions.map((permission) => permission.key),
  member: ['auth.me.read', 'auth.session.manage'],
};

const seedUsers = [
  {
    email: 'admin@example.com',
    displayName: 'System Admin',
    password: 'password123',
    roleKey: 'admin',
    emailVerified: true,
  },
  {
    email: 'member@example.com',
    displayName: 'Default Member',
    password: 'password123',
    roleKey: 'member',
    emailVerified: true,
  },
] as const;

async function main() {
  const orm = await MikroORM.init({
    ...buildDatabaseConfig(process.env),
    entities: [
      CurrentUserEntity,
      CurrentUserCredentialEntity,
      UserSessionEntity,
      PasswordResetTokenEntity,
      EmailVerificationTokenEntity,
      RoleEntity,
      PermissionEntity,
      UserRoleEntity,
      RolePermissionEntity,
    ],
  });

  try {
    const em = orm.em.fork();
    const configService = new ConfigService(process.env);
    const passwordService = new BcryptPasswordHasher(
      buildAuthConfig(configService),
    );

    await orm.getMigrator().up();

    const roleByKey = new Map<string, RoleEntity>();

    for (const roleSeed of roles) {
      let role = await em.findOne(RoleEntity, { key: roleSeed.key });

      if (!role) {
        role = em.create(RoleEntity, roleSeed);
      } else {
        role.name = roleSeed.name;
        role.description = roleSeed.description;
      }

      roleByKey.set(role.key, role);
      em.persist(role);
    }

    const permissionByKey = new Map<string, PermissionEntity>();

    for (const permissionSeed of permissions) {
      let permission = await em.findOne(PermissionEntity, {
        key: permissionSeed.key,
      });

      if (!permission) {
        permission = em.create(PermissionEntity, permissionSeed);
      } else {
        permission.name = permissionSeed.name;
        permission.description = permissionSeed.description;
      }

      permissionByKey.set(permission.key, permission);
      em.persist(permission);
    }

    await em.flush();

    for (const [roleKey, permissionKeys] of Object.entries(rolePermissionMap)) {
      const role = roleByKey.get(roleKey);

      if (!role) {
        throw new Error(`Missing seed role: ${roleKey}`);
      }

      for (const permissionKey of permissionKeys) {
        const permission = permissionByKey.get(permissionKey);

        if (!permission) {
          throw new Error(`Missing seed permission: ${permissionKey}`);
        }

        const existingRolePermission = await em.findOne(RolePermissionEntity, {
          role,
          permission,
        });

        if (!existingRolePermission) {
          em.persist(
            em.create(RolePermissionEntity, {
              role,
              permission,
              grantedAt: new Date(),
            }),
          );
        }
      }
    }

    await em.flush();

    for (const userSeed of seedUsers) {
      let user = await em.findOne(
        CurrentUserEntity,
        { email: userSeed.email },
        { populate: ['credential'] },
      );

      if (!user) {
        user = em.create(CurrentUserEntity, {
          email: userSeed.email,
          displayName: userSeed.displayName,
          status: UserStatus.ACTIVE,
          emailVerifiedAt: userSeed.emailVerified ? new Date() : undefined,
        });
        em.persist(user);
      } else {
        user.displayName = userSeed.displayName;
        user.status = UserStatus.ACTIVE;
        user.emailVerifiedAt = userSeed.emailVerified ? new Date() : undefined;
      }

      const passwordHash = await passwordService.hash(userSeed.password);

      if (!user.credential) {
        user.credential = em.create(CurrentUserCredentialEntity, {
          user,
          passwordHash,
          passwordUpdatedAt: new Date(),
        });
        em.persist(user.credential);
      } else {
        user.credential.passwordHash = passwordHash;
        user.credential.passwordUpdatedAt = new Date();
      }

      const role = roleByKey.get(userSeed.roleKey);

      if (!role) {
        throw new Error(`Missing role for user seed: ${userSeed.roleKey}`);
      }

      const existingUserRole = await em.findOne(UserRoleEntity, {
        user,
        role,
      });

      if (!existingUserRole) {
        em.persist(
          em.create(UserRoleEntity, {
            user,
            role,
            assignedAt: new Date(),
          }),
        );
      }
    }

    await em.flush();

    console.log('Seed completed');
    console.log('Users:');
    console.log('- admin@example.com / password123 (admin)');
    console.log('- member@example.com / password123 (member)');
  } finally {
    await orm.close(true);
  }
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
