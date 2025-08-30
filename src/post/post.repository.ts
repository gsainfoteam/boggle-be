import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/req/createPost.dto';
import { PostListQueryDto } from './dto/req/postListQuery.dto';
import { Post, PostType, Prisma, RoommateDetails, User } from '@prisma/client';

type SearchRow = {
  id: string;
  title: string | null;
  rank: number;
  createdAt: Date;
  snippet?: string | null;
};

const DOC = Prisma.sql`
(
    setweight(to_tsvector('english', COALESCE(p.title, '')), 'A') ||
    setweight(to_tsvector('english', immutable_array_to_string(p.tags, ' ')), 'B') ||
    setweight(to_tsvector('english', COALESCE(p.content, '')), 'C')
)`;

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
          ...(post.title && { title: post.title }),
          content: post.content,
          type: post.type,
          tags: post.tags,
          author: { connect: { id: authorId } },
          participants: { connect: [{ id: authorId }] },
          maxParticipants: post.maxParticipants,
          createdAt: new Date(new Date().getTime()),
          ...(post.deadline && { deadline: post.deadline }),
          imageUrls: post.imageUrls,
          ...(post.type === 'ROOMMATE' &&
            post.roommateDetails && {
              roommateDetails: {
                create: {
                  age: post.roommateDetails.age,
                  gender: post.roommateDetails.gender,
                  grade: post.roommateDetails.grade,
                  room: post.roommateDetails.room,
                  semester: post.roommateDetails.semester,

                  refrigerator: post.roommateDetails.refrigerator,
                  wifi: post.roommateDetails.wifi,
                  snoring: post.roommateDetails.snoring,
                  smoking: post.roommateDetails.smoking,
                  ...(post.roommateDetails.sleepTime && {
                    sleepTime: post.roommateDetails.sleepTime,
                  }),
                  ...(post.roommateDetails.wakeUpTime && {
                    wakeUpTime: post.roommateDetails.wakeUpTime,
                  }),
                  ...(post.roommateDetails.mbti && {
                    mbti: post.roommateDetails.mbti,
                  }),

                  ...(post.roommateDetails.rmRefrigerator && {
                    rmRefrigerator: post.roommateDetails.rmRefrigerator,
                  }),
                  ...(post.roommateDetails.rmWifi && {
                    rmWifi: post.roommateDetails.rmWifi,
                  }),
                  ...(post.roommateDetails.rmSnoring && {
                    rmSnoring: post.roommateDetails.rmSnoring,
                  }),
                  ...(post.roommateDetails.rmSmoking && {
                    rmSmoking: post.roommateDetails.rmSmoking,
                  }),
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
          ...(post.title && { title: post.title }),
          content: post.content,
          type: post.type,
          tags: post.tags,
          maxParticipants: post.maxParticipants,
          ...(post.deadline && { deadline: post.deadline }),
          imageUrls: post.imageUrls,
          ...(post.type === 'ROOMMATE' &&
            post.roommateDetails && {
              roommateDetails: {
                create: {
                  age: post.roommateDetails.age,
                  gender: post.roommateDetails.gender,
                  grade: post.roommateDetails.grade,
                  room: post.roommateDetails.room,
                  semester: post.roommateDetails.semester,

                  refrigerator: post.roommateDetails.refrigerator,
                  wifi: post.roommateDetails.wifi,
                  snoring: post.roommateDetails.snoring,
                  smoking: post.roommateDetails.smoking,
                  ...(post.roommateDetails.sleepTime && {
                    sleepTime: post.roommateDetails.sleepTime,
                  }),
                  ...(post.roommateDetails.wakeUpTime && {
                    wakeUpTime: post.roommateDetails.wakeUpTime,
                  }),
                  ...(post.roommateDetails.mbti && {
                    mbti: post.roommateDetails.mbti,
                  }),

                  ...(post.roommateDetails.rmRefrigerator && {
                    rmRefrigerator: post.roommateDetails.rmRefrigerator,
                  }),
                  ...(post.roommateDetails.rmWifi && {
                    rmWifi: post.roommateDetails.rmWifi,
                  }),
                  ...(post.roommateDetails.rmSnoring && {
                    rmSnoring: post.roommateDetails.rmSnoring,
                  }),
                  ...(post.roommateDetails.rmSmoking && {
                    rmSmoking: post.roommateDetails.rmSmoking,
                  }),
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

  async webSearch(
    q: string,
    { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {},
  ): Promise<SearchRow[]> {
    const L = Math.min(Math.max(limit, 1), 100);
    const O = Math.max(offset, 0);

    return await this.prisma.$queryRaw<SearchRow[]>(Prisma.sql`
              WITH query AS (
                  SELECT websearch_to_tsquery('english', ${q}) AS q
              )
              SELECT
                  p.id,
                  p.title,
                  ts_rank_cd(${DOC}, query.q) AS rank,
                  p."createdAt"
              FROM
                  "Post" p,
                  query
              WHERE
                  ${DOC} @@ query.q
              ORDER BY
                  rank DESC,
                  p."createdAt" DESC
              OFFSET ${O}
              LIMIT ${L};
          `);
  }
}
