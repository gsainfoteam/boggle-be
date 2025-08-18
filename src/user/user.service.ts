import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { TokenDto } from './dto/token.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { UserRepository } from './user.repository';
import { UserDto } from './dto/user.dto';
import { IdpUserInfoDto } from './dto/idpUserInfo.dto';

@Injectable()
export class UserService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly idpTokenUrl: string;
  private readonly idpUserInfoUrl: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly userRepository: UserRepository,
  ) {
    this.clientId = this.configService.get<string>('CLIENT_ID') as string;
    this.clientSecret = this.configService.get<string>(
      'CLIENT_SECRET',
    ) as string;
    this.idpTokenUrl = this.configService.get<string>(
      'IDP_TOKEN_URL',
    ) as string;
    this.idpUserInfoUrl = this.configService.get<string>(
      'IDP_USERINFO_URL',
    ) as string;
  }

  async login(code: string): Promise<TokenDto> {
    const response = (
      await firstValueFrom(
        this.httpService.post(
          this.idpTokenUrl,
          new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            code_verifier: 'code_challenge',
          }),
          {
            headers: {
              Authorization: `Basic ${Buffer.from(
                `${this.clientId}:${this.clientSecret}`,
              ).toString('base64')}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      ).catch((error) => {
        if (error.status === 400)
          throw new BadRequestException('Code is expired or wrong');
        throw new InternalServerErrorException('Internal server error');
      })
    ).data;

    const userInfo = await this.idpUserInfo(response.access_token);

    if (userInfo) {
      await this.userRepository.findOrCreateUser(userInfo);
      return {
        access_token: response.access_token,
      };
    }
    throw new UnauthorizedException();
  }

  async findUser(id: string): Promise<UserDto> {
    return await this.userRepository.findUser(id);
  }

  async deleteUser(id: string): Promise<UserDto> {
    await this.userRepository.deleteUser(id);
    return this.findUser(id);
  }

  async idpUserInfo(token: string): Promise<IdpUserInfoDto> {
    return (
      await firstValueFrom(
        await this.httpService.get(this.idpUserInfoUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ).catch((error) => {
        if (error.status === 400)
          throw new BadRequestException('Token is expired or wrong');
        else if (error.status === 401)
          throw new UnauthorizedException('Token is not authorized');
        throw new InternalServerErrorException('Internal server error');
      })
    ).data;
  }
}
