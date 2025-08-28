import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { RoommatePostDto } from '../roommatePost.dto';

export class CreatePostDto {
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

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ example: 5 })
  readonly maxParticipants: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ApiProperty({ example: '2000-01-01' })
  readonly deadline?: Date;

  @IsArray()
  @ApiProperty({ example: ['abc', 'def'] })
  readonly imageUrls: string[];

  @IsOptional()
  @Type(() => RoommatePostDto)
  @ApiPropertyOptional({ type: RoommatePostDto })
  readonly roommateDetails?: RoommatePostDto;
}
