import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsNumber, IsString } from 'class-validator';
import { participantDto } from './participant.dto';
import { PostType } from '@prisma/client';

export class PostDto {
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

  @IsString()
  @ApiProperty({ example: 'name of author' })
  readonly author: string;

  @IsString()
  @ApiProperty({ example: '2d87779b-7632-4163-afa0-5062d83e325b' })
  readonly authorId: string;

  @IsArray()
  @ApiProperty({ type: [participantDto] })
  readonly participants: participantDto[];

  @IsNumber()
  @ApiProperty({ example: 5 })
  readonly maxParticipants: number;

  @IsString()
  @ApiProperty({ example: '2000-01-01T00:00:00.000Z' })
  readonly createdAt: Date;

  @IsDate()
  @ApiProperty({ example: '2000-01-01T00:00:00.000Z' })
  readonly deadline: Date;
}
