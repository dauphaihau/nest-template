import type { UserStatus } from '../../auth/domain/enums/user-status.enum';

export interface UserSummary {
  id: string;
  email: string;
  displayName?: string;
  status: UserStatus;
}
