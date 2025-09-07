import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PostType, User } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { RoommatePostDto } from '../roommatePost.dto';
import { basicUserDto } from './searchResponse.dto';

export class PostDto {
  @IsString()
  @ApiProperty({ example: '70025914-2097-4eb1-9ebb-c2181f02b4f3' })
  readonly id: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'this is title' })
  readonly title: string | null;

  @IsString()
  @ApiProperty({ example: 'this is content' })
  readonly content: string;

  @IsEnum(PostType)
  @ApiProperty({ enum: PostType, example: PostType.ROOMMATE })
  readonly type: PostType;

  @IsArray()
  @ApiProperty({ example: ['abc', 'def'] })
  readonly tags: string[];

  @IsObject()
  @Transform(({ value }: { value: User }) => {
    return { id: value.id, name: value.name };
  })
  @ApiProperty({ example: basicUserDto })
  readonly author: basicUserDto | User;

  @IsArray()
  @Transform(({ value }: { value: User[] }) =>
    value.map((user) => {
      return { id: user.id, name: user.name };
    }),
  )
  @ApiProperty({ type: [basicUserDto] })
  readonly participants: basicUserDto[] | User[];

  @IsNumber()
  @ApiProperty({ example: 5 })
  readonly maxParticipants: number;

  @IsDate()
  @ApiProperty({ example: '2000-01-01T00:00:00.000Z' })
  readonly createdAt: Date;

  @IsOptional()
  @IsDate()
  @ApiProperty({ example: '2000-01-01T00:00:00.000Z' })
  readonly deadline: Date | null;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ example: ['abc', 'def'] })
  readonly imageUrls: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => RoommatePostDto)
  @ApiPropertyOptional({ type: RoommatePostDto })
  readonly roommateDetails: RoommatePostDto | null;

  constructor(partial: Partial<PostDto>) {
    Object.assign(this, partial);
  }
}

export class PostListDto {
  @IsArray()
  @Type(() => PostDto)
  @ApiProperty({ type: [PostDto] })
  readonly posts: PostDto[];

  @IsNumber()
  @ApiProperty({ example: 1 })
  readonly total: number;
}
