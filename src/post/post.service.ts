import { ForbiddenException, Injectable } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { PostDto, PostListDto } from './dto/res/post.dto';
import { CreatePostDto } from './dto/req/createPost.dto';
import { PostListQueryDto } from './dto/req/postListQuery.dto';
import { Post } from '@prisma/client';
import { SearchDto } from './dto/req/search.dto';
import { SearchResponseDto } from './dto/res/searchResponse.dto';

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

  async search(dto: SearchDto): Promise<SearchResponseDto> {
    const trimmed = (dto.query ?? '').trim();
    const Limit = dto.limit ?? 20;
    const Offset = dto.offset ?? 0;
    if (!trimmed) return { posts: [], total: 0 };
    const { posts, total } = await this.postRepository.webSearch(trimmed, {
      limit: Limit,
      offset: Offset,
    });
    return { posts, total };
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
