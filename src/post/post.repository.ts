import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostFullContent } from './types/postFullContent';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { PostListQueryDto } from './dto/postListQuery.dto';

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPostList({
    skip,
    take,
    type,
  }: PostListQueryDto): Promise<PostFullContent[]> {
    return await this.prisma.post.findMany({
      skip: skip,
      take: take,
      orderBy: { createdAt: 'asc' },
      where: {
        postType: type === 'ALL' ? undefined : type,
      },
      include: {
        author: {
          select: {
            uuid: true,
            name: true,
          },
        },
        participants: {
          select: {
            uuid: true,
            name: true,
          },
        },
      },
    });
  }

  async getPost(uuid: string): Promise<PostFullContent> {
    return await this.prisma.post
      .findUniqueOrThrow({
        where: { uuid: uuid },
        include: {
          author: {
            select: {
              uuid: true,
              name: true,
            },
          },
          participants: {
            select: {
              uuid: true,
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
          postType: type,
          tags: tags,
          author: { connect: { uuid: authorId } },
          participants: { connect: [{ uuid: authorId }] },
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

  async updatePost(
    uuid: string,
    { title, content, type, tags, maxParticipants, deadline }: UpdatePostDto,
  ) {
    return await this.prisma.post
      .update({
        where: { uuid: uuid },
        data: {
          title: title,
          content: content,
          postType: type,
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

  async joinPost(uuid: string, user: string) {
    return await this.prisma.post
      .update({
        where: {
          uuid: uuid,
        },
        data: {
          participants: {
            connect: { uuid: user },
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

  async deleteUser(uuid: string, user: string) {
    return await this.prisma.post
      .update({
        where: {
          uuid: uuid,
        },
        data: {
          participants: {
            disconnect: {
              uuid: user,
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

  async deletePost(uuid: string): Promise<PostFullContent> {
    return await this.prisma.post
      .delete({
        where: { uuid: uuid },
        include: {
          author: {
            select: {
              uuid: true,
              name: true,
            },
          },
          participants: {
            select: {
              uuid: true,
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
