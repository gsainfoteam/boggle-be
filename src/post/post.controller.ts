import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { PostIdDto } from './dto/postId.dto';
import { PostDto } from './dto/post.dto';
import { JwtAuthGuard } from 'src/auth/strategy/jwtAuth.guard';
import { CreatePostDto } from './dto/createPost.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get(':uuid')
  @ApiOperation({
    summary: 'Get post',
    description: 'Get post using id of post',
  })
  @ApiParam({ name: 'uuid', type: String, description: 'Uuid of a post' })
  @ApiOkResponse({
    type: PostDto,
    description: 'Return information of a post',
  })
  @ApiNotFoundResponse({ description: 'ID is Not Found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async getPost(@Param() { uuid }: PostIdDto): Promise<PostDto> {
    return await this.postService.getPost(uuid);
  }

  @Post()
  @ApiOperation({
    summary: 'Create Post',
    description: 'Create post',
  })
  @ApiBody({ type: CreatePostDto })
  @ApiOkResponse({
    type: PostDto,
    description: 'Return information of a created post',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Exception' })
  @ApiNotFoundResponse({ description: 'User uid is not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createPost(@Body() postDto: CreatePostDto): Promise<PostDto> {
    return await this.postService.createPost(postDto);
  }
}
