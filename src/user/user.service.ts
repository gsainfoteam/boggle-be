import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse, isAxiosError } from 'axios';

import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

import { UserRepository } from './user.repository';
import { TokenDto } from './dto/token.dto';
import { UserDto } from './dto/user.dto';
import { IdpUserInfoDto } from './dto/idpUserInfo.dto';
import { PostDto } from 'src/post/dto/post.dto';

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
    this.clientId = this.configService.get<string>('CLIENT_ID')!;
    this.clientSecret = this.configService.get<string>('CLIENT_SECRET')!;
    this.idpTokenUrl = this.configService.get<string>('IDP_TOKEN_URL')!;
    this.idpUserInfoUrl = this.configService.get<string>('IDP_USERINFO_URL')!;
  }

  private handleAxiosError(error: unknown): never {
    if (isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 400) {
        throw new BadRequestException('Token/code is expired or wrong');
      }
      if (status === 401) {
        throw new UnauthorizedException('Token is not authorized');
      }
    }
    throw new InternalServerErrorException('Internal server error');
  }

  async login(code: string): Promise<TokenDto> {
    const authHeader = `Basic ${Buffer.from(
      `${this.clientId}:${this.clientSecret}`,
    ).toString('base64')}`;

    type TokenResponse = { access_token: string };

    try {
      const response: AxiosResponse<TokenResponse> = await firstValueFrom(
        this.httpService.post<TokenResponse>(
          this.idpTokenUrl,
          new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            code_verifier: 'code_challenge',
          }),
          {
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      const accessToken = response.data.access_token;

      const userInfo = await this.idpUserInfo(accessToken);
      if (!userInfo) {
        throw new UnauthorizedException();
      }

      await this.userRepository.findOrCreateUser(userInfo);

      return { access_token: accessToken };
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  async findUser(id: string): Promise<UserDto> {
    const user = await this.userRepository.findUser(id);
    return new UserDto({ ...user });
  }

  async deleteUser(id: string): Promise<UserDto> {
    await this.userRepository.deleteUser(id);
    return this.findUser(id);
  }

  async idpUserInfo(token: string): Promise<IdpUserInfoDto> {
    try {
      const res: AxiosResponse<IdpUserInfoDto> = await firstValueFrom(
        this.httpService.get<IdpUserInfoDto>(this.idpUserInfoUrl, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      return res.data;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }
}
