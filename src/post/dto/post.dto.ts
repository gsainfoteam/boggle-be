import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PostType } from '@prisma/client';
import { UserDto } from './User.dto';
import { Type } from 'class-transformer';

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
  @Type(() => roommatePostDto)
  readonly roommateDetails?: roommatePostDto;
}

export class roommatePostDto {
  @IsNumber()
  @ApiProperty({ example: 1 })
  readonly grade: number;

  @IsString()
  @ApiProperty({ example: 'G100' })
  readonly room: string;

  @IsString()
  @ApiProperty({ example: '2025-1' })
  readonly semester: string;

  @IsBoolean()
  @ApiProperty({ example: true })
  readonly refrigerator: boolean;

  @IsBoolean()
  @ApiProperty({ example: true })
  readonly wifi: boolean;

  @IsBoolean()
  @ApiProperty({ example: true })
  readonly snoring: boolean;

  @IsBoolean()
  @ApiProperty({ example: true })
  readonly smoking: boolean;

  @IsString()
  @ApiProperty({ example: '22:00' })
  readonly sleepTime: string;

  @IsString()
  @ApiProperty({ example: '08:00' })
  readonly wakeUpTime: string;

  @IsString()
  @ApiProperty({ example: 'INTJ' })
  readonly mbti: string;

  @IsBoolean()
  @ApiProperty({ example: true })
  readonly rmRefrigerator: boolean;

  @IsBoolean()
  @ApiProperty({ example: true })
  readonly rmWifi: boolean;

  @IsBoolean()
  @ApiProperty({ example: true })
  readonly rmSnoring: boolean;

  @IsBoolean()
  @ApiProperty({ example: true })
  readonly rmSmoking: boolean;

  @IsString()
  @ApiProperty({ example: 'INTJ' })
  readonly rmMbti: string;
}
