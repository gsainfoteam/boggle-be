import { ApiProperty } from '@nestjs/swagger';
import { PostType } from '@prisma/client';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class PostListDto {
  @IsString()
  @ApiProperty({ example: '70025914-2097-4eb1-9ebb-c2181f02b4f3' })
  readonly uuid: string;

  @IsString()
  @ApiProperty({ example: 'this is title' })
  readonly title: string;

  @IsString()
  @ApiProperty({ example: 'this is content' })
  readonly content: string;

  @IsString()
  @ApiProperty({ example: 'type' })
  readonly type: PostType;

  @IsNumber()
  @ApiProperty({ example: 3 })
  readonly participants: number;

  @IsNumber()
  @ApiProperty({ example: 5 })
  readonly maxParticipants: number;

  @IsDate()
  @ApiProperty({ example: '2000-01-01T00:00:00.000Z' })
  readonly deadline: Date;
}
