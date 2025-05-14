import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { LoginDto } from './dto/req/login.dto';
import { UserRepository } from './user.repository';
import { JwtTokenType } from './types/jwtToken.type';
import { InfoteamIdpService } from '@lib/infoteam-idp';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private configService: ConfigService,
    private readonly infoteamIdpService: InfoteamIdpService,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * this method is used to infoteam idp login,
   * so we can assume user must have idp account
   * because the sign up is handled by idp
   *
   * @returns accessToken, refreshToken and the information that is  the user consent required
   */
  async login({ code, type }: LoginDto): Promise<JwtTokenType> {
    if (!code || !type) {
      this.logger.debug('invalid code or type');
      throw new BadRequestException();
    }
    const redirectUri = this.configService.get<string>('URI')!;
    const tokens = await this.infoteamIdpService.getAccessToken(
      code,
      redirectUri,
    );
    const userInfo = await this.infoteamIdpService.getUserInfo(
      tokens.access_token,
    );
    const user = await this.userRepository.findUserOrCreate({
      uuid: userInfo.uuid,
      name: userInfo.name,
    });
    return {
      ...tokens,
      consent_required: !user?.consent,
    };
  }
}
