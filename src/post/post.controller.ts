import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { PostIdDto } from './dto/postId.dto';
import { PostDto } from './dto/post.dto';
import { JwtAuthGuard } from 'src/auth/strategy/jwtAuth.guard';
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
import { UpdatePostDto } from './dto/updatePost.dto';
import { PostFullContent } from './types/postFullContent';
import { CreatePostDto } from './dto/createPost.dto';
import { PostListQueryDto } from './dto/postListQuery.dto';
import { PostListDto } from './dto/postList.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiOperation({
    summary: 'Get list of post',
    description: 'Get list of post using cursor and take',
  })
  @ApiOkResponse({
    type: PostDto,
    description: 'Return information of a post',
  })
  @ApiNotFoundResponse({ description: 'Post uuid is Not Found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async getPostList(@Query() query: PostListQueryDto): Promise<PostListDto> {
    return await this.postService.getPostList(query);
  }

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
  @ApiNotFoundResponse({ description: ' Post uuid is Not Found' })
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
  @ApiNotFoundResponse({ description: 'User uuid is not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createPost(@Body() postDto: CreatePostDto): Promise<PostDto> {
    return await this.postService.createPost(postDto);
  }

  @Put(':uuid')
  @ApiOperation({
    summary: 'Update Post',
    description: 'Update post',
  })
  @ApiParam({ name: 'uuid', type: String })
  @ApiBody({ type: UpdatePostDto })
  @ApiOkResponse({
    type: PostDto,
    description: 'Return information of a updated post',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Exception' })
  @ApiNotFoundResponse({ description: 'Post uuid is not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @Param() { uuid }: PostIdDto,
    @Body() postDto: UpdatePostDto,
  ): Promise<PostDto> {
    return await this.postService.updatePost(uuid, postDto);
  }

  @Delete(':uuid')
  @ApiOperation({
    summary: 'Delete Post',
    description: 'Delete post',
  })
  @ApiParam({ name: 'uuid', type: String })
  @ApiOkResponse({
    type: PostDto,
    description: 'Return information of a deleted post',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Exception' })
  @ApiNotFoundResponse({ description: 'Post uuid is not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async deletePost(@Param() { uuid }: PostIdDto): Promise<PostFullContent> {
    return await this.postService.deletePost(uuid);
  }
}
