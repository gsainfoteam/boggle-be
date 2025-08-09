import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  Request,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/strategy/jwtAuth.guard';
import { UpdateUserDto } from './dto/updateUser.dto';
import { PayloadDto } from 'src/auth/dto/payload.dto';
import { UserIdDto } from './dto/userId.dto';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';
import { UserDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  @ApiOperation({ summary: 'create a user' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async login(@Body() { code }: LoginDto): Promise<TokenDto> {
    return await this.userService.login(code);
  }

  @Get()
  @ApiOperation({ summary: 'Get self', description: 'Get self by JWT' })
  @ApiOkResponse({ type: UserDto, description: 'Return user information' })
  @ApiNotFoundResponse({ description: 'User Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async findSelf(
    @Request() req: Request & { user: PayloadDto },
  ): Promise<UserDto> {
    return this.userService.findUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user', description: 'Get user by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Id of a user' })
  @ApiOkResponse({ type: UserDto, description: 'Return user information' })
  @ApiNotFoundResponse({ description: 'User Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async findUser(@Param() { id }: UserIdDto): Promise<UserDto> {
    return this.userService.findUser(id);
  }

  @Delete()
  @ApiOperation({
    summary: 'Delete User',
    description: 'Delete user information in db',
  })
  @ApiOkResponse({
    type: UserIdDto,
    description: 'Return deleted user information',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Exception' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  deleteUser(@Request() req: Request & { user: PayloadDto }): Promise<UserDto> {
    return this.userService.deleteUser(req.user.id);
  }
}
