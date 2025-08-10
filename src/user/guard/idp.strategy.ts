import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';

@Injectable()
export class IdPStrategy extends PassportStrategy(Strategy, 'idp') {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
  ) {
    super();
  }

  async validate(token: string) {
    const userInfo = await this.userService.idpUserInfo(token);
    const user = await this.userRepository.findOrCreateUser(userInfo);
    return user.id;
  }
}
