import { ApiProperty } from '@nestjs/swagger';
import { PostType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class PostListQueryDto {
  @IsString()
  @ApiProperty({ example: 'ALL' })
  readonly type: PostType | 'ALL';

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ example: 1 })
  readonly skip: number;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ example: 3 })
  readonly take: number;
}
