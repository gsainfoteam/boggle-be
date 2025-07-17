import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
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
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'login',
    description:
      'login (and if user is not existed, create user) and issue access-token and refresh-token',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    type: TokenDto,
    description: 'Return access-token and refresh-token',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Exception' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async login(@Body() body: LoginDto): Promise<TokenDto> {
    return await this.authService.login(body);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'refresh token',
    description: 'reissue access-token using refresh-token',
  })
  @ApiBody({ type: RefreshDto })
  @ApiOkResponse({
    type: TokenDto,
    description: 'Return access-token and refresh-token',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Exception' })
  @ApiNotFoundResponse({ description: 'Not Found Exception' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async refresh(@Body() { refresh_token }: RefreshDto): Promise<TokenDto> {
    if (!refresh_token) throw new UnauthorizedException('Unauthorized Token');
    return await this.authService.refreshToken(refresh_token);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'logout',
    description: 'Logout (delete refresh-token in db)',
  })
  @ApiBody({ type: LogoutDto })
  @ApiOkResponse({ description: 'Return Nothing' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Exception' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async logout(@Body() { access_token }: LogoutDto): Promise<void> {
    return await this.authService.logout(access_token);
  }
}
