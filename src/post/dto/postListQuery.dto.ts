import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class PostListQueryDto {
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ example: 1 })
  readonly skip: number;

  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ example: 3 })
  readonly take: number;
}
