import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Post,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserIdDto } from './dto/req/userId.dto';
import { LoginDto } from './dto/req/login.dto';
import { TokenDto } from './dto/res/token.dto';
import { UserDto } from './dto/res/user.dto';
import { IdPGuard } from './guard/idp.guard';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  @ApiOperation({ summary: 'create a user' })
  @ApiOkResponse({ type: TokenDto, description: 'Return access token' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async login(@Body() { code }: LoginDto): Promise<TokenDto> {
    return await this.userService.login(code);
  }

  @Get()
  @ApiOperation({ summary: 'Get self', description: 'Get self by token' })
  @ApiOkResponse({ type: UserDto, description: 'Return user information' })
  @ApiNotFoundResponse({ description: 'User Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
  @UseGuards(IdPGuard)
  async findSelf(@Request() req: Request & { user: string }): Promise<UserDto> {
    return this.userService.findUser(req.user);
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
  @UseGuards(IdPGuard)
  deleteUser(@Request() req: Request & { user: string }): Promise<UserDto> {
    return this.userService.deleteUser(req.user);
  }
}
