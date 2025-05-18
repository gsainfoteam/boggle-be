import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UserDto } from 'src/auth/dto/user.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findUser(uuid: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { uuid: uuid },
      select: {
        uuid: true,
        name: true,
        email: true,
        password: true,
        studentId: true,
        major: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User uuid is not found');
    }
    return plainToInstance(UserDto, user);
  }

  async updateUser(uuid: string, user: UserDto) {
    return await this.prisma.user
      .update({
        where: {
          uuid: uuid,
        },
        data: {
          uuid: user.uuid,
          name: user.name,
          email: user.email,
          password: user.password,
          studentId: user.studentId,
          major: user.major,
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
  }

  async deleteUser(uuid: string): Promise<UserDto> {
    return await this.prisma.user
      .delete({
        where: { uuid: uuid },
      })
      .catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025')
            throw new NotFoundException('User uuid is not found');
          throw new InternalServerErrorException('Database error');
        }
        throw new InternalServerErrorException('Internal serval error');
      });
  }
}
