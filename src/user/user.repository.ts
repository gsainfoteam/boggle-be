
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UserDto } from 'src/auth/dto/user.dto';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/updateUser.dto';
import { PostDto } from 'src/post/dto/post.dto';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findUser(uuid: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { uuid: uuid },
      select: {
        uuid: true,
        name: true,
        email: true,
        studentId: true,
        major: true,
        posts: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User uuid is not found');
    }
    return {
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      major: user.major,
      posts: plainToInstance(PostDto, user.posts),
    };
  }

  async updateUser(
    uuid: string,
    { password }: UpdateUserDto,
  ): Promise<UserDto> {
    await this.prisma.user
      .update({
        where: {
          uuid: uuid,
        },
        data: {
          password: await bcrypt.hash(password, 10),
        },
      })
      .catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025')
            throw new NotFoundException('User uuid is not found');
          throw new InternalServerErrorException('Database error');
        }
        throw new InternalServerErrorException('Internal server error');
      });

    return this.findUser(uuid);
  }

  async deleteUser(uuid: string): Promise<UserDto> {
    await this.prisma.user
      .update({
        where: { uuid: uuid },
        data: { status: 'INACTIVE' },
      })
      .catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025')
            throw new NotFoundException('User uuid is not found');
          throw new InternalServerErrorException('Database error');
        }
        throw new InternalServerErrorException('Internal serval error');
      });

    return this.findUser(uuid);
  }
}
