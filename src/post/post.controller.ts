import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { PostIdDto } from './dto/postId.dto';
import { PostDto } from './dto/post.dto';
import { JwtAuthGuard } from 'src/auth/strategy/jwtAuth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PostFullContent } from './types/postFullContent';
import { CreatePostDto } from './dto/createPost.dto';
import { PostListDto, PostListQueryDto } from './dto/postList.dto';
import { PayloadDto } from 'src/auth/dto/payload.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiOperation({
    summary: 'Get list of post',
    description: 'Get list of post using cursor and take',
  })
  @ApiOkResponse({
    type: PostListDto,
    description: 'Return information of a post',
  })
  @ApiNotFoundResponse({ description: 'Post uuid is Not Found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async getPostList(@Query() query: PostListQueryDto): Promise<PostListDto> {
    return await this.postService.getPostList(query);
  }

  @Get(':id')
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
  async getPost(@Param() { id }: PostIdDto): Promise<PostDto> {
    return await this.postService.getPost(id);
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
  async createPost(
    @Body() postDto: CreatePostDto,
    @Request() req: Request & { user: PayloadDto },
  ): Promise<PostDto> {
    return await this.postService.createPost(postDto, req.user);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update Post',
    description: 'Update post',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: CreatePostDto })
  @ApiOkResponse({
    type: PostDto,
    description: 'Return information of a updated post',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Exception' })
  @ApiForbiddenResponse({ description: 'User uuid is not matched' })
  @ApiNotFoundResponse({ description: 'Post uuid is not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @Param() { id }: PostIdDto,
    @Body() postDto: CreatePostDto,
    @Request() req: Request & { user: PayloadDto },
  ): Promise<PostDto> {
    return await this.postService.updatePost(id, postDto, req.user);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Join Post',
    description: 'User Join Post',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({
    type: PostDto,
    description: 'Return information of a updated post',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Exception' })
  @ApiNotFoundResponse({ description: 'Post uuid is not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async joinPost(
    @Param() { id }: PostIdDto,
    @Request() req: Request & { user: PayloadDto },
  ): Promise<PostDto> {
    return await this.postService.joinPost(id, req.user);
  }

  @Patch(':postId/participant/:userId')
  @ApiOperation({
    summary: 'Exit Post',
    description: 'Exit post by user of author',
  })
  @ApiParam({ name: 'postUuid', type: String })
  @ApiParam({ name: 'userUuid', type: String })
  @ApiOkResponse({
    type: PostDto,
    description: 'Return information of a deleted post',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Exception' })
  @ApiForbiddenResponse({ description: 'User uuid is not matched' })
  @ApiNotFoundResponse({ description: 'Post uuid is not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async deleteUser(
    @Param('postId') post: string,
    @Param('userId') user: string,
    @Request() req: Request & { user: PayloadDto },
  ): Promise<PostDto> {
    return await this.postService.deleteUser(post, user, req.user);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete Post',
    description: 'Delete post',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({
    type: PostDto,
    description: 'Return information of a deleted post',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Exception' })
  @ApiForbiddenResponse({ description: 'User uuid is not matched' })
  @ApiNotFoundResponse({ description: 'Post uuid is not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async deletePost(
    @Param() { id }: PostIdDto,
    @Request() req: Request & { user: PayloadDto },
  ) {
    return await this.postService.deletePost(id, req.user);
  }
}
