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
import { z } from 'zod';
import { SearchPostDto, SearchResponseDto } from './dto/res/searchResponse.dto';

const searchRowSchema = z.object({
  id: z.string().uuid(),
  rank: z.number(),
  createdAt: z.coerce.date(),
  total: z.coerce.number(),
});

//For a custom immutable_array_to_string function, refer to prisma\migrations\20250828014743_add_post_fts_gin
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
    query: string,
    { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {},
  ): Promise<SearchResponseDto> {
    const l = limit ?? 20;
    const o = offset ?? 0;
    const L = Math.min(Math.max(l, 1), 100);
    const O = Math.max(o, 0);

    const rows = await this.prisma.$queryRaw<unknown[]>(Prisma.sql`
              WITH query AS (
                  SELECT websearch_to_tsquery('english', ${query}) AS q
              )
              SELECT
                  p.id::uuid AS id,
                  ts_rank_cd(${DOC}, query.q)::float8 AS rank,
                  p."createdAt"::timestamptz AS "createdAt",
                  COUNT(*) OVER ()::bigint AS total  
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
    const parsed = searchRowSchema.array().safeParse(rows);
    if (!parsed.success) {
      throw new InternalServerErrorException('Invalid search row shape');
    }

    const orderedRows = parsed.data;
    if (orderedRows.length === 0) {
      return { posts: [], total: 0 };
    }
    const total = orderedRows[0].total;
    const ids = orderedRows.map((post) => post.id);
    const posts = await this.prisma.post.findMany({
      where: { id: { in: ids } },
      include: {
        author: { select: { id: true, name: true } },
        participants: { select: { id: true, name: true } },
        roommateDetails: true,
      },
    });

    const byId = new Map(posts.map((p) => [p.id, p]));
    const items = orderedRows
      .map((h) => {
        const p = byId.get(h.id);
        if (!p) return undefined;
        return {
          id: p.id,
          title: p.title,
          content: p.content,
          type: p.type,
          tags: p.tags,
          author: { id: p.author.id, name: p.author.name } as Pick<
            User,
            'id' | 'name'
          >,
          participants: p.participants.map((participant) => ({
            id: participant.id,
            name: participant.name,
          })) as Array<Pick<User, 'id' | 'name'>>,
          maxParticipants: p.maxParticipants,
          createdAt: p.createdAt,
          deadline: p.deadline,
          imageUrls: p.imageUrls ?? [],
          roommateDetails: p.roommateDetails,
          authorId: p.authorId,
          status: p.status,
          rank: h.rank,
        };
      })
      .filter(Boolean) as SearchPostDto[];

    return { posts: items, total };
  }
}
