import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import {
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TokenDto } from './dto/token.dto';
import { RefreshDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'login',
    description: 'login (and if user is not existed, create user)',
  })
  @ApiBody({ type: AuthDto })
  @ApiOkResponse({
    type: TokenDto,
    description: 'Return access-token and refresh-token',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Exception' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async login(@Body() body: AuthDto): Promise<TokenDto> {
    return await this.authService.login(body);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'refresh token',
    description: ' refresh token',
  })
  @ApiBody({ type: RefreshDto })
  @ApiOkResponse({
    type: RefreshDto,
    description: 'Return access-token and refresh-token',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Exception' })
  @ApiNotFoundResponse({ description: 'Not Found Exception' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async refresh(@Body() body: RefreshDto) {
    if (!body.refresh_token)
      throw new UnauthorizedException('Unauthorized Token');
    return await this.authService.refreshToken(body.refresh_token);
  }
}
