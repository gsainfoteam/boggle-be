import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserDto } from 'src/auth/dto/user.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserRepository } from './user.repository';
@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async findUser(uuid: string): Promise<UserDto> {
    return await this.userRepository.findUser(uuid);
  }

  async updateUser(uuid: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    return await this.userRepository.updateUser(uuid, updateUserDto);
  }

  async deleteUser(uuid: string): Promise<UserDto> {
    return await this.userRepository.deleteUser(uuid);
  }
  
}