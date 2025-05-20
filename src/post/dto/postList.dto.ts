import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';
import { PostDto } from './post.dto';

export class PostListDto {
  @IsArray()
  @ApiProperty({ type: [PostDto] })
  posts: PostDto[];

  @IsNumber()
  @ApiProperty({ example: 1 })
  total: number;
}
