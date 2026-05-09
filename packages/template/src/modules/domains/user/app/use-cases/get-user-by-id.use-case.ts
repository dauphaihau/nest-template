import { Injectable } from '@nestjs/common';
import { UserRepository } from '../ports/user.repository';

@Injectable()
export class GetUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  execute(id: string) {
    return this.userRepository.findById(id);
  }
}

