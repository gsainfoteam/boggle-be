import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { PostDto } from 'src/post/dto/post.dto';
import { firstValueFrom } from 'rxjs';
import { TokenDto } from './dto/token.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { UserRepository } from './user.repository';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly idpTokenUrl: string;
  private readonly idpUserInfoUrl: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private prisma: PrismaService,
    private readonly userRepository: UserRepository,
  ) {
    this.clientId = this.configService.get<string>('CLIENT_ID') as string;
    this.clientSecret = this.configService.get<string>(
      'CLIENT_SECRET',
    ) as string;
    this.idpTokenUrl = this.configService.get<string>(
      'IDP_TOKEN_URL',
    ) as string;
    this.idpUserInfoUrl = this.configService.get<string>(
      'IDP_USERINFO_URL',
    ) as string;
  }

  async login(code: string): Promise<TokenDto> {
    // Get Code
    // https://idp.gistory.me/authorize?client_id=7f16b001-6333-4106-8e60-7f397dad86b1&redirect_uri=http://localhost:3000/redirect&response_type=code&scope=profile student_id email phone_number&code_challenge=code_challenge&code_challenge_method=plain

    const response = (
      await firstValueFrom(
        this.httpService.post(
          this.idpTokenUrl,
          new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            code_verifier: 'code_challenge',
          }),
          {
            headers: {
              Authorization: `Basic ${Buffer.from(
                `${this.clientId}:${this.clientSecret}`,
              ).toString('base64')}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      )
    ).data;

    const userInfo = await this.idpUserInfo(response.access_token);

    if (userInfo) {
      this.userRepository.findOrCreateUser(userInfo);
      return {
        access_token: response.access_token,
      };
    }
    throw new UnauthorizedException();
  }

  async findUser(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true,
        posts: {
          select: {
            id: true,
            title: true,
            content: true,
            type: true,
            tags: true,
            authorId: true,
            participants: true,
            maxParticipants: true,
            createdAt: true,
            deadline: true,
          },
        },
        status: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User id is not found');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      posts: plainToInstance(PostDto, user.posts),
      status: user.status,
    };
  }

  async deleteUser(id: string): Promise<UserDto> {
    await this.prisma.user
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

    return this.findUser(id);
  }

  async idpUserInfo(token: string) {
    return (
      await firstValueFrom(
        this.httpService.get(this.idpUserInfoUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      )
    ).data;
  }
}
