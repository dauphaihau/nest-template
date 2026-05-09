import { Injectable } from '@nestjs/common';
import { UserRepository } from '../ports/user.repository';

@Injectable()
export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  execute() {
    return this.userRepository.findAll();
  }
}

