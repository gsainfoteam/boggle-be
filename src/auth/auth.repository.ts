import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { PayloadDto } from './dto/payload.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthRepository {
  private readonly logger = new Logger(AuthRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateUser(body: LoginDto) {
    return await this.prisma.user
      .findFirst({ where: { email: body.email } })
      .then(async (user) => {
        if (!user)
          return await this.prisma.user
            .create({
              data: {
                sub: 'aaaa',
                name: body.email,
                email: body.email,
                studentId: '20250000',
              },
            })
            .catch((error) => {
              this.logger.debug(error);
              if (error instanceof PrismaClientKnownRequestError) {
                throw new InternalServerErrorException('Database Error');
              }
              throw new InternalServerErrorException('Internal Server Error');
            });
        else return user;
      });
  }

  async saveToken(id: string, token: string) {}

  async findUser(payload: PayloadDto) {
    return await this.prisma.user
      .findUnique({ where: { id: payload.id } })
      .then((user) => {
        if (!user) throw new NotFoundException('User id is not found');
        return user;
      });
  }

  async deleteToken(payload: PayloadDto): Promise<void> {}
}
