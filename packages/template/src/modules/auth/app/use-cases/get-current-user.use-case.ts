import { Injectable } from '@nestjs/common';
import { AuthenticatedUser, UserProfile } from '../auth.types';

@Injectable()
export class GetCurrentUserUseCase {
  async execute(currentUser: AuthenticatedUser): Promise<UserProfile> {
    return {
      id: currentUser.userId,
      email: currentUser.email,
      displayName: currentUser.displayName,
      status: currentUser.status,
      sessionId: currentUser.sessionId,
      roles: currentUser.roles,
      permissions: currentUser.permissions,
    };
  }
}
