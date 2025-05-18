import { Injectable } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { PostDto } from './dto/post.dto';
import { CreatePostDto } from './dto/createPost.dto';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async getPost(uuid: string): Promise<PostDto> {
    const post = await this.postRepository.getPost(uuid);
    return {
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
}
