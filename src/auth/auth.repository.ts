import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UserDto } from './dto/user.dto';

@Injectable()
export class AuthRepository {
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
              throw new InternalServerErrorException();
            });
        else return user;
      });
  }
}
