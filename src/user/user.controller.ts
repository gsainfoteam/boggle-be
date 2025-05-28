import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  Request,
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
import { UserDto } from 'src/auth/dto/user.dto';
import { uuidDto } from './dto/uuid.dto';
import { JwtAuthGuard } from 'src/auth/strategy/jwtAuth.guard';
import { UpdateUserDto } from './dto/updateUser.dto';
import { PayloadDto } from 'src/auth/dto/payload.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
    return this.userService.findUser(req.user.uuid);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get user', description: 'Get user by ID' })
  @ApiParam({ name: 'uuid', type: String, description: 'Uuid of a user' })
  @ApiOkResponse({ type: UserDto, description: 'Return user information' })
  @ApiNotFoundResponse({ description: 'User Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async findUser(@Param() { uuid }: uuidDto): Promise<UserDto> {
    return this.userService.findUser(uuid);
  }

  @Patch()
  @ApiOperation({
    summary: 'Update User',
    description: 'Update user information',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: UserDto, description: 'Return user information' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Exception' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  updateUser(
    @Body() UserDto: UpdateUserDto,
    @Request() req: Request & { user: PayloadDto },
  ): Promise<UserDto> {
    return this.userService.updateUser(req.user.uuid, UserDto);
  }

  @Delete()
  @ApiOperation({
    summary: 'Delete User',
    description: 'Delete user information in db',
  })
  @ApiOkResponse({
    type: uuidDto,
    description: 'Return deleted user information',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Exception' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  deleteUser(@Request() req: Request & { user: PayloadDto }): Promise<UserDto> {
    return this.userService.deleteUser(req.user.uuid);
  }
}
