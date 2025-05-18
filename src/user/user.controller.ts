import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
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
import { updateUserDto } from './dto/updateUser.to';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':uuid')
  @ApiOperation({ summary: 'Get user', description: 'Get user by ID' })
  @ApiParam({ name: 'uuid', type: String, description: 'Uuid of a user' })
  @ApiOkResponse({ type: UserDto, description: 'Return user information' })
  @ApiNotFoundResponse({ description: 'User Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async findUser(@Param() { uuid }: uuidDto): Promise<UserDto> {
    return this.userService.findUser(uuid);
  }

  @Patch(':uuid')
  @ApiOperation({
    summary: 'Update User',
    description: 'Update user information',
  })
  @ApiParam({ name: 'uuid', type: String, description: 'Uuid of a user' })
  @ApiBody({ type: updateUserDto })
  @ApiOkResponse({ type: UserDto, description: 'Return user information' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Exception' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  updateUser(
    @Param() { uuid }: uuidDto,
    @Body() UserDto: updateUserDto,
  ): Promise<UserDto> {
    return this.userService.updateUser(uuid, UserDto);
  }

  @Delete(':uuid')
  @ApiOperation({
    summary: 'Delete User',
    description: 'Delete user information in db',
  })
  @ApiParam({ name: 'uuid', type: String, description: 'Uuid of a user' })
  @ApiOkResponse({
    type: uuidDto,
    description: 'Return deleted user information',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Exception' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  deleteUser(@Param() { uuid }: uuidDto): Promise<UserDto> {
    return this.userService.deleteUser(uuid);
  }
}
