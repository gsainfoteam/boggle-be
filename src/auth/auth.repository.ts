import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UserDto } from './dto/user.dto';
import { PayloadDto } from './dto/payload.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthRepository {
  private readonly logger = new Logger(AuthRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateUser(body: LoginDto): Promise<UserDto> {
    return await this.prisma.user
      .findFirst({ where: { email: body.email } })
      .then(async (user) => {
        if (!user)
          return await this.prisma.user
            .create({
              data: {
                name: body.email,
                email: body.email,
                password: await bcrypt.hash(body.password, 10),
                studentId: 20250000,
                major: '전자전기컴퓨터공학부',
              },
            })
            .catch((err) => {
              this.logger.debug(err);
              throw new InternalServerErrorException();
            });
        else return user;
      });
  }

  async saveToken(uuid: string, token: string) {
    await this.prisma.user.update({
      where: { uuid: uuid },
      data: { refreshToken: token },
    });
  }

  async findUser(payload: PayloadDto) {
    return await this.prisma.user
      .findUnique({ where: { uuid: payload.uuid } })
      .then((user) => {
        if (!user) throw new NotFoundException('User Not Found');
        return user;
      });
  }

  async deleteToken(payload: PayloadDto): Promise<void> {
    await this.prisma.user.update({
      where: { uuid: payload.uuid },
      data: { refreshToken: null },
    });
  }
}
