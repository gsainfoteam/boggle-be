import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  PostRepository,
} from './post.repository';
import { PostDto, PostListDto } from './dto/res/post.dto';
import { CreatePostDto } from './dto/req/createPost.dto';
import { PostListQueryDto } from './dto/req/postListQuery.dto';
import { Post } from '@prisma/client';
import { SearchDto } from './dto/req/search.dto';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async getPostList(query: PostListQueryDto): Promise<PostListDto> {
    const posts = (await this.postRepository.getPostList(query)).map((post) => {
      return new PostDto({ ...post });
    });
    const total = await this.postRepository.getCount(query.type);
    return { posts: posts, total: total };
  }

  async getPost(id: string): Promise<PostDto> {
    const post = await this.postRepository.getPost(id);
    return new PostDto({ ...post });
  }

  async createPost(postDto: CreatePostDto, user: string): Promise<PostDto> {
    const post = await this.postRepository.createPost(postDto, user);

    return this.getPost(post.id);
  }

  async search(dto: SearchDto): Promise<PostListDto> {
    const query = (dto.query ?? '').trim();
    const Limit = dto.limit ?? DEFAULT_LIMIT;
    const Offset = dto.offset ?? DEFAULT_OFFSET;
    if (!query) return { posts: [], total: 0 };

    const { rows: orderedRows, posts } = await this.postRepository.webSearch(
      query,
      {
        limit: Limit,
        offset: Offset,
      },
    );

    if (orderedRows.length === 0) {
      return { posts: [], total: 0 };
    }

    const total = orderedRows[0].total;

    const byId = new Map(posts.map((p) => [p.id, p]));

    const items = orderedRows
      .map((row) => {
        const post = byId.get(row.id);
        return post ? new PostDto({ ...post }) : null;
      })
      .filter((item): item is PostDto => item !== null);

    return { posts: items, total };
  }

  async updatePost(
    id: string,
    postDto: CreatePostDto,
    user: string,
  ): Promise<PostDto> {
    const authorId = (await this.postRepository.getPost(id)).authorId;
    if (authorId !== user) throw new ForbiddenException('Not match user id');

    await this.postRepository.updatePost(id, postDto);
    return this.getPost(id);
  }

  async joinPost(id: string, user: string): Promise<PostDto> {
    await this.postRepository.joinPost(id, user);
    return this.getPost(id);
  }

  async deleteUser(
    postId: string,
    userId: string,
    user: string,
  ): Promise<PostDto> {
    const post = await this.getPost(postId);
    if (user !== post.author.id && user !== userId)
      throw new ForbiddenException('Forbidden Access');
    await this.postRepository.deleteUser(postId, userId);
    return await this.getPost(postId);
  }

  async deletePost(id: string, user: string): Promise<Post> {
    const authorId = (await this.postRepository.getPost(id)).authorId;
    if (authorId !== user) throw new ForbiddenException('Not match user id');

    return await this.postRepository.deletePost(id);
  }
}
