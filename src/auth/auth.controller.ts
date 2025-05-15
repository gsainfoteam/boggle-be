import { Body, Controller, Post } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import {
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TokenDto } from './dto/token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'login',
    description: 'login (and if user is not existed, create user)',
  })
  @ApiBody({ type: AuthDto })
  @ApiOkResponse({ type: TokenDto, description: 'Return access-token' })
  @ApiUnauthorizedResponse({ description: 'UnauthorizedException' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async login(@Body() body: AuthDto): Promise<TokenDto> {
    return await this.authService.login(body);
  }
}
