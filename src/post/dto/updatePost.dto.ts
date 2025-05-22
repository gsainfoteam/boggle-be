import { ApiProperty } from '@nestjs/swagger';
import { PostType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsNumber, IsString } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @ApiProperty({ example: 'this is title' })
  readonly title: string;

  @IsString()
  @ApiProperty({ example: 'this is content' })
  readonly content: string;

  @IsString()
  @ApiProperty({ example: 'PROJECT' })
  readonly type: PostType;

  @IsArray()
  @ApiProperty({ example: ['abc', 'def'] })
  readonly tags: string[];

  @IsNumber()
  @ApiProperty({ example: 5 })
  readonly maxParticipants: number;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({ example: '2000-01-01' })
  readonly deadline: Date;
}
