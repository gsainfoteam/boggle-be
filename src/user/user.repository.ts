import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '@lib/prisma';

@Injectable()
export class UserRepository {
  private readonly logger = new Logger(UserRepository.name);
  constructor(private readonly prismaService: PrismaService) {}

  async findUserOrCreate({
    uuid,
    name,
  }: Pick<User, 'uuid' | 'name'>): Promise<User> {
    const user = await this.prismaService.user
      .findUnique({
        where: { uuid },
      })
      .catch((err) => {
        this.logger.debug(err);
        if (err instanceof PrismaClientKnownRequestError) {
          this.logger.error('findUserOrCreate(find) Prisma error');
          throw new InternalServerErrorException('Database error');
        }
        this.logger.error('findUserOrCreate(find) error');
        throw new InternalServerErrorException('Unknown error');
      });
    if (user) {
      return user;
    }
    return this.prismaService.user
      .create({
        data: {
          uuid,
          name,
          consent: false,
        },
      })
      .catch((err) => {
        this.logger.debug(err);
        if (err instanceof PrismaClientKnownRequestError) {
          this.logger.error('findUserOrCreate(create) Prisma error');
          throw new InternalServerErrorException('Database error');
        }
        this.logger.error('findUserOrCreate(create) error');
        throw new InternalServerErrorException('Unknown error');
      });
  }
}
