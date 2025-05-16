import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserDto } from 'src/auth/dto/user.dto';
import { uidDto } from './dto/uid.dto';
import { JwtAuthGuard } from 'src/auth/strategy/jwtAuth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':uid')
  @ApiOperation({ summary: 'Get user', description: 'Get user by ID' })
  @ApiParam({ name: 'uid', type: Number, description: 'user id' })
  @ApiOkResponse({ type: UserDto, description: 'Return user information' })
  @ApiNotFoundResponse({ description: 'User Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async findUser(@Param() { uid }: uidDto): Promise<UserDto> {
    return this.userService.findUser(uid);
  }

  @Put()
  @ApiOperation({
    summary: 'Update User',
    description: 'Update user information',
  })
  @ApiBody({ type: UserDto })
  @ApiOkResponse({ type: UserDto, description: 'Return user information' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Exception' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @UseGuards(JwtAuthGuard)
  updateUser(@Body() UserDto: UserDto): Promise<UserDto> {
    return this.userService.updateUser(UserDto);
  }

  @Delete(':uid')
  @ApiOperation({
    summary: 'Delete User',
    description: 'Delete user information in db',
  })
  @ApiParam({ name: 'uid', type: Number, description: 'user id' })
  @ApiOkResponse({ type: uidDto, description: 'User deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Exception' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @UseGuards(JwtAuthGuard)
  deleteUser(@Param() { uid }: uidDto) {
    return this.userService.deleteUser(uid);
  }
}
