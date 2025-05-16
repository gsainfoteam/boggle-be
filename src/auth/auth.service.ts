import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from './dto/token.dto';
import { PayloadDto } from './dto/payload.dto';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authRepository: AuthRepository,
  ) {}

  async login(body: LoginDto): Promise<TokenDto> {
    const user = await this.authRepository.findOrCreateUser(body);

    if (!(await bcrypt.compare(body.password, user.password)))
      throw new UnauthorizedException('Password is failed');

    const payload: PayloadDto = { id: user.id };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '1d',
    });

    await this.authRepository.saveToken(payload.id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenDto> {
    try {
      const payload: PayloadDto & { iat } & { exp } = this.jwtService.verify(
        refreshToken,
        {
          secret: this.configService.get<string>('JWT_SECRET'),
        },
      );

      delete payload.iat;
      delete payload.exp;

      const user = await this.authRepository.findUser(payload);
      if (refreshToken !== user.refreshToken)
        throw new UnauthorizedException('Unauthorized Token');

      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      });

      return { access_token: accessToken, refresh_token: refreshToken };
    } catch (err) {
      this.logger.debug(err);
      throw new UnauthorizedException('Unauthorized Token');
    }
  }

  async logout(accessToken: string): Promise<void> {
    const payload: PayloadDto & { iat } & { exp } = this.jwtService.verify(
      accessToken,
      {
        secret: this.configService.get<string>('JWT_SECRET'),
      },
    );

    return this.authRepository.deleteToken(payload);
  }
}
