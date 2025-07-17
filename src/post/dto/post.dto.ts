import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PostType } from '@prisma/client';
import { UserDto } from './User.dto';
import { Type } from 'class-transformer';
import { RoommatePostDto } from './roommatePost.dto';

export class PostDto {
  @IsString()
  @ApiProperty({ example: '70025914-2097-4eb1-9ebb-c2181f02b4f3' })
  readonly id: string;

  @IsString()
  @ApiProperty({ example: 'this is title' })
  readonly title: string;

  @IsString()
  @ApiProperty({ example: 'this is content' })
  readonly content: string;

  @IsString()
  @ApiProperty({ example: 'type' })
  readonly type: PostType;

  @IsArray()
  @ApiProperty({ example: ['abc', 'def'] })
  readonly tags: string[];

  @IsString()
  @ApiProperty({ example: UserDto })
  readonly author: UserDto;

  @IsArray()
  @ApiProperty({ type: [UserDto] })
  readonly participants: UserDto[];

  @IsNumber()
  @ApiProperty({ example: 5 })
  readonly maxParticipants: number;

  @IsDate()
  @ApiProperty({ example: '2000-01-01T00:00:00.000Z' })
  readonly createdAt: Date;

  @IsDate()
  @ApiProperty({ example: '2000-01-01T00:00:00.000Z' })
  readonly deadline: Date;

  @IsOptional()
  @ValidateNested()
  @Type(() => RoommatePostDto)
  @ApiPropertyOptional({ type: RoommatePostDto })
  readonly roommateDetails?: RoommatePostDto;
}
