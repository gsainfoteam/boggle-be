import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostFullContent } from './types/postFullContent';
import { CreatePostDto } from './dto/createPost.dto';

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

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
            throw new NotFoundException('Post Not found');
          }
          throw new InternalServerErrorException('Database Error');
        }
        throw new InternalServerErrorException('Internal Server Error');
      });
  }

  async createPost({
    title,
    content,
    type,
    authorId,
    maxParticipants,
    deadline,
  }: CreatePostDto) {
    return await this.prisma.post
      .create({
        data: {
          title: title,
          content: content,
          postType: type,
          author: { connect: { uuid: authorId } },
          participants: { connect: [{ uuid: authorId }] },
          maxParticipants: maxParticipants,
          createdAt: new Date(new Date().getTime()),
          deadline: deadline,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new NotFoundException('User uuid is not found');
          }
          throw new InternalServerErrorException('Database Error');
        }
        throw new InternalServerErrorException('Internal Server Error');
      });
  }
}
