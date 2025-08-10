import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { User } from '@prisma/client';

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
        this.logger.debug(error);
        if (error instanceof PrismaClientKnownRequestError) {
          throw new InternalServerErrorException('Database Error');
        }
        throw new InternalServerErrorException('Internal Server Error');
      });
  }
}
