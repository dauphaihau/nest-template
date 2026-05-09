import { UserSummary } from '../user.types';

export abstract class UserRepository {
  abstract findAll(): Promise<UserSummary[]>;
  abstract findById(id: string): Promise<UserSummary | null>;
}

