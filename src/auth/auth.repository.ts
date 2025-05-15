import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UserDto } from './dto/user.dto';
import { PayloadDto } from './dto/payload.dto';

@Injectable()
export class AuthRepository {
  private readonly logger = new Logger(AuthRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateUser(body: AuthDto): Promise<UserDto> {
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
                studentID: 20250000,
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

  async saveToken(id: number, token: string) {
    await this.prisma.user.update({
      where: { id: id },
      data: { refreshToken: token },
    });
  }

  async findUser(payload: PayloadDto) {
    return await this.prisma.user
      .findUnique({ where: { id: payload.id } })
      .then((user) => {
        if (!user) throw new NotFoundException('User Not Found');
        return user;
      });
  }
}
