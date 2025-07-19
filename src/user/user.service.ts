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
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findUser(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        studentId: true,
        major: true,
        posts: {
          select: {
            id: true,
            title: true,
            content: true,
            type: true,
            tags: true,
            authorId: true,
            participants: true,
            maxParticipants: true,
            createdAt: true,
            deadline: true,
          },
        },
        status: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User id is not found');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      studentId: user.studentId,
      major: user.major,
      posts: plainToInstance(PostDto, user.posts),
      status: user.status,
    };
  }

  async updateUser(id: string, { password }: UpdateUserDto): Promise<UserDto> {
    await this.prisma.user
      .update({
        where: {
          id: id,
        },
        data: {
          password: await bcrypt.hash(password, 10),
        },
      })
      .catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025')
            throw new NotFoundException('User id is not found');
          throw new InternalServerErrorException('Database error');
        }
        throw new InternalServerErrorException('Internal server error');
      });

    return this.findUser(id);
  }

  async deleteUser(id: string): Promise<UserDto> {
    await this.prisma.user
      .update({
        where: { id: id },
        data: { status: 'INACTIVE' },
      })
      .catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025')
            throw new NotFoundException('User id is not found');
          throw new InternalServerErrorException('Database error');
        }
        throw new InternalServerErrorException('Internal serval error');
      });

    return this.findUser(id);
  }
  
}