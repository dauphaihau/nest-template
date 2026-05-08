import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from '../../app/auth.types';
import { AUTH_REQUIRED_PERMISSIONS_KEY } from '../rest/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(
        AUTH_REQUIRED_PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? [];

    if (requiredPermissions.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();
    const currentUser = request.user;

    if (!currentUser) {
      return false;
    }

    const hasAllPermissions = requiredPermissions.every((permission) =>
      currentUser.permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Missing required permissions');
    }

    return true;
  }
}
