import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Post, Prisma, User } from '@prisma/client';

@Injectable()
export class UserRepository {
  private readonly logger = new Logger(UserRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateUser(userInfo): Promise<User> {
    return await this.prisma.user
      .upsert({
        where: { sub: userInfo.sub },
        update: {},
        create: {
          sub: userInfo.sub,
          name: userInfo.name,
          email: userInfo.email,
          studentId: userInfo.student_id,
        },
      })
      .catch((error) => {
        this.logger.error(error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new InternalServerErrorException('Database Error');
        }
        throw new InternalServerErrorException('Internal Server Error');
      });
  }

  async findUser(id: string): Promise<User & { posts: Post[] }> {
    return await this.prisma.user.findUniqueOrThrow({
      where: { id: id },
      include: {
        posts: true,
      },
    });
  }

  async deleteUser(id: string): Promise<User> {
    return await this.prisma.user
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
  }
}
