import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginDto } from './dto/req/login.dto';
import { JwtToken } from './dto/res/jwtToken.dto';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'Login with idp',
    description:
      'idp redirect to this endpoint with code, then this endpoint return jwt token to users',
  })
  @ApiOkResponse({ type: JwtToken, description: 'Return jwt token' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @Get('login')
  async loginByIdP(
    @Query() { code, type }: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<JwtToken> {
    const { refresh_token, ...token } = await this.userService.login({
      code,
      type:
        type ??
        ((req.headers['user-agent'] as string).includes('Dart')
          ? 'flutter'
          : 'web'),
    });
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    return { ...token };
  }
}
