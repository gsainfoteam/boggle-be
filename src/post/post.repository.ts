import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostFullContent } from './types/postFullContent';
import { CreatePostDto } from './dto/createPost.dto';
import { PostListQueryDto } from './dto/postList.dto';

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPostList({ skip, take, type }: PostListQueryDto) {
    return await this.prisma.post.findMany({
      skip: skip,
      take: take,
      orderBy: { createdAt: 'asc' },
      where: {
        type: type === 'ALL' ? undefined : type,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        participants: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getPost(id: string) {
    return await this.prisma.post
      .findUniqueOrThrow({
        where: { id: id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          participants: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new NotFoundException('Post uuid is not found');
          }
          throw new InternalServerErrorException('Database Error');
        }
        throw new InternalServerErrorException('Internal Server Error');
      });
  }

  async createPost(
    { title, content, type, tags, maxParticipants, deadline }: CreatePostDto,
    authorId: string,
  ) {
    return await this.prisma.post
      .create({
        data: {
          title: title,
          content: content,
          type: type,
          tags: tags,
          author: { connect: { id: authorId } },
          participants: { connect: [{ id: authorId }] },
          maxParticipants: maxParticipants,
          createdAt: new Date(new Date().getTime()),
          deadline: deadline,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          throw new InternalServerErrorException('Database Error');
        }
        throw new InternalServerErrorException('Internal Server Error');
      });
  }

  async createRoommatePost(post: CreatePostDto, authorId: string) {
    if (!post.roommateDetails) {
      throw new BadRequestException('Roommate details are required');
    }

    return await this.prisma.post
      .create({
        data: {
          title: post.title,
          content: post.content,
          type: post.type,
          tags: post.tags,
          author: { connect: { id: authorId } },
          participants: { connect: [{ id: authorId }] },
          maxParticipants: post.maxParticipants,
          createdAt: new Date(new Date().getTime()),
          deadline: post.deadline,
          roommateDetails: {
            create: {
              grade: post.roommateDetails.grade,
              room: post.roommateDetails.room,
              semester: post.roommateDetails.semester,

              refrigerator: post.roommateDetails.refrigerator,
              wifi: post.roommateDetails.wifi,
              snoring: post.roommateDetails.snoring,
              smoking: post.roommateDetails.smoking,
              sleepTime: post.roommateDetails.sleepTime,
              wakeUpTime: post.roommateDetails.wakeUpTime,
              mbti: post.roommateDetails.mbti,

              rmRefrigerator: post.roommateDetails.rmRefrigerator,
              rmWifi: post.roommateDetails.rmWifi,
              rmSnoring: post.roommateDetails.rmSnoring,
              rmSmoking: post.roommateDetails.rmSmoking,
              rmMbti: post.roommateDetails.rmMbti,
            },
          },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          throw new InternalServerErrorException('Database Error');
        }
        throw new InternalServerErrorException('Internal Server Error');
      });
  }

  async updatePost(
    id: string,
    { title, content, type, tags, maxParticipants, deadline }: CreatePostDto,
  ) {
    return await this.prisma.post
      .update({
        where: { id: id },
        data: {
          title: title,
          content: content,
          type: type,
          tags: tags,
          maxParticipants: maxParticipants,
          deadline: deadline,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new NotFoundException('Post uuid is not found');
          }
          throw new InternalServerErrorException('Database Error');
        }
        throw new InternalServerErrorException('Internal Server Error');
      });
  }

  async joinPost(id: string, user: string) {
    return await this.prisma.post
      .update({
        where: {
          id: id,
        },
        data: {
          participants: {
            connect: { id: user },
          },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new NotFoundException('Post uuid is not found');
          }
          throw new InternalServerErrorException('Database Error');
        }
        throw new InternalServerErrorException('Internal Server Error');
      });
  }

  async deleteUser(id: string, user: string) {
    return await this.prisma.post
      .update({
        where: {
          id: id,
        },
        data: {
          participants: {
            disconnect: {
              id: user,
            },
          },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025')
            throw new NotFoundException('Post uuid is not found');
          throw new InternalServerErrorException('Database error');
        }
        throw new InternalServerErrorException('Internal serval error');
      });
  }

  async deletePost(id: string) {
    return await this.prisma.post
      .delete({
        where: { id: id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          participants: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025')
            throw new NotFoundException('Post uuid is not found');
          throw new InternalServerErrorException('Database error');
        }
        throw new InternalServerErrorException('Internal serval error');
      });
  }

  async getCount(): Promise<number> {
    return await this.prisma.post.count();
  }
}
