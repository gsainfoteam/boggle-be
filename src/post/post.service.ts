import { ForbiddenException, Injectable } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { PostDto } from './dto/post.dto';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { PostFullContent } from './types/postFullContent';
import { PostListQueryDto } from './dto/postListQuery.dto';
import { PostListDto } from './dto/postList.dto';
import { PayloadDto } from 'src/auth/dto/payload.dto';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async getPostList(query: PostListQueryDto): Promise<PostListDto> {
    const posts = (await this.postRepository.getPostList(query)).map((post) => {
      return {
        uuid: post.uuid,
        title: post.title,
        content: post.content,
        type: post.postType,
        author: post.author.name,
        authorId: post.authorId,
        participants: post.participants,
        maxParticipants: post.maxParticipants,
        createdAt: post.createdAt,
        deadline: post.deadline,
      };
    });
    const total = await this.postRepository.getCount();
    return { posts: posts, total: total };
  }

  async getPost(uuid: string): Promise<PostDto> {
    const post = await this.postRepository.getPost(uuid);
    return {
      uuid: post.uuid,
      title: post.title,
      content: post.content,
      type: post.postType,
      author: post.author.name,
      authorId: post.authorId,
      participants: post.participants,
      maxParticipants: post.maxParticipants,
      createdAt: post.createdAt,
      deadline: post.deadline,
    };
  }

  async createPost(postDto: CreatePostDto): Promise<PostDto> {
    const post = await this.postRepository.createPost(postDto);
    return this.getPost(post.uuid);
  }

  async updatePost(
    uuid: string,
    postDto: UpdatePostDto,
    user: PayloadDto,
  ): Promise<PostDto> {
    const authorId = (await this.postRepository.getPost(uuid)).authorId;
    if (authorId !== user.uuid)
      throw new ForbiddenException('Not match user uuid');

    await this.postRepository.updatePost(uuid, postDto);
    return this.getPost(uuid);
  }

  async joinPost(uuid: string, user: PayloadDto): Promise<PostDto> {
    await this.postRepository.joinPost(uuid, user.uuid);
    return this.getPost(uuid);
  }

  async deleteUser(
    postUuid: string,
    userUuid: string,
    user: PayloadDto,
  ): Promise<PostDto> {
    const post = await this.getPost(postUuid);
    if (user.uuid !== post.authorId && user.uuid !== userUuid)
      throw new ForbiddenException('Forbidden Access');
    await this.postRepository.deleteUser(postUuid, userUuid);
    return await this.getPost(postUuid);
  }

  async deletePost(uuid: string, user: PayloadDto): Promise<PostFullContent> {
    const authorId = (await this.postRepository.getPost(uuid)).authorId;
    if (authorId !== user.uuid)
      throw new ForbiddenException('Not match user uuid');

    return await this.postRepository.deletePost(uuid);
  }
}
