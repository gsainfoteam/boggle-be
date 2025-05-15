import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async findUser(uid: number) {
    const useri = await this.prisma.user.findUnique({
      where: { uid: uid },
    });
    if (!useri) {
      throw new NotFoundException('ID is not found');
    }
    return useri;
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async createUser(RegisterUserDto: RegisterUserDto) {
    return await this.prisma.user.create({
      data: 
      {
        name: RegisterUserDto.name,
        password: RegisterUserDto.password,
        email: RegisterUserDto.email,
        studentId: RegisterUserDto.studentId,
        phoneNumber: RegisterUserDto.phoneNumber,
        major: RegisterUserDto.major,
        grade: RegisterUserDto.grade,
      }
    }).catch((error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === 'P2002')
          throw new InternalServerErrorException('Personal information must not be duplicated');
      throw new InternalServerErrorException();
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async deleteUser(uid: number) {
    return await this.prisma.user.delete({
      where: { uid: uid },
  }).catch((error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === 'P2025')
          throw new NotFoundException('User not found');
      throw new InternalServerErrorException();
    });
  }
}
