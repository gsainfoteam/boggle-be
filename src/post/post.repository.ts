import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/req/createPost.dto';
import { PostListQueryDto } from './dto/req/postListQuery.dto';
import { Post, PostType, RoommateDetails, User } from '@prisma/client';

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPostList({ skip, take, type }: PostListQueryDto): Promise<
    (Post & {
      author: User;
      participants: User[];
      roommateDetails: RoommateDetails | null;
    })[]
  > {
    return await this.prisma.post.findMany({
      skip: skip,
      take: take,
      orderBy: { createdAt: 'asc' },
      where: {
        type: type === 'ALL' ? undefined : type,
      },
      include: {
        author: true,
        participants: true,
        roommateDetails: true,
      },
    });
  }

  async getPost(id: string): Promise<
    Post & {
      author: User;
      participants: User[];
      roommateDetails: RoommateDetails | null;
    }
  > {
    return await this.prisma.post
      .findUniqueOrThrow({
        where: { id: id },
        include: {
          author: true,
          participants: true,
          roommateDetails: true,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new NotFoundException('Post id is not found');
          }
          throw new InternalServerErrorException('Database Error');
        }
        throw new InternalServerErrorException('Internal Server Error');
      });
  }

  async createPost(post: CreatePostDto, authorId: string): Promise<Post> {
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
          ...(post.type === 'ROOMMATE' &&
            post.roommateDetails && {
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
            }),
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          throw new InternalServerErrorException('Database Error');
        }
        throw new InternalServerErrorException('Internal Server Error');
      });
  }

  async updatePost(id: string, post: CreatePostDto): Promise<Post> {
    return await this.prisma.post
      .update({
        where: { id: id },
        data: {
          title: post.title,
          content: post.content,
          type: post.type,
          tags: post.tags,
          maxParticipants: post.maxParticipants,
          deadline: post.deadline,
          ...(post.type === 'ROOMMATE' &&
            post.roommateDetails && {
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
            }),
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new NotFoundException('Post id is not found');
          }
          throw new InternalServerErrorException('Database Error');
        }
        throw new InternalServerErrorException('Internal Server Error');
      });
  }

  async joinPost(id: string, user: string): Promise<Post> {
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
            throw new NotFoundException('Post id is not found');
          }
          throw new InternalServerErrorException('Database Error');
        }
        throw new InternalServerErrorException('Internal Server Error');
      });
  }

  async deleteUser(id: string, user: string): Promise<Post> {
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
            throw new NotFoundException('Post id is not found');
          throw new InternalServerErrorException('Database error');
        }
        throw new InternalServerErrorException('Internal server error');
      });
  }

  async deletePost(id: string): Promise<Post> {
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
            throw new NotFoundException('Post id is not found');
          throw new InternalServerErrorException('Database error');
        }
        throw new InternalServerErrorException('Internal server error');
      });
  }

  async getCount(type: PostType | 'ALL'): Promise<number> {
    return await this.prisma.post.count({
      where: {
        type: type === 'ALL' ? undefined : type,
      },
    });
  }
}
