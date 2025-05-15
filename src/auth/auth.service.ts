import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from './dto/token.dto';
import { PayloadDto } from './dto/payload.dto';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authRepository: AuthRepository,
  ) {}

  async login(body: AuthDto): Promise<TokenDto> {
    const user = await this.authRepository.findOrCreateUser(body);

    if (!(await bcrypt.compare(body.password, user.password)))
      throw new UnauthorizedException('Password is failed');

    const payload: PayloadDto = { id: user.id };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    return {
      access_token: accessToken,
    };
  }
}
