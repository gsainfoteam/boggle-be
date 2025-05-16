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

  async findUser(uid: number): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { uid: uid },
      select: {
        uid: true,
        name: true,
        email: true,
        password: true,
        studentId: true,
        major: true,
      },
    });
    if (!user) {
      throw new NotFoundException('ID is Not Found');
    }
    return plainToInstance(UserDto, user);
  }

  async updateUser(user: UserDto) {
    return await this.prisma.user.update({
      where: {
        uid: user.uid,
      },
      data: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        password: user.password,
        studentId: user.studentId,
        major: user.major,
      },
    });
  }

  async deleteUser(uid: number): Promise<UserDto> {
    return await this.prisma.user
      .delete({
        where: { uid: uid },
      })
      .catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError)
          if (error.code === 'P2025')
            throw new NotFoundException('User Not Found');
        throw new InternalServerErrorException();
      });
  }
}
