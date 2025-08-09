import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { IsArray, IsNumber, IsString } from 'class-validator';
import { PostDto } from 'src/post/dto/post.dto';

export class UserDto {
  @IsString()
  @ApiProperty({ example: '2d87779b-7632-4163-afa0-5062d83e325b' })
  readonly id: string;

  @IsString()
  @ApiProperty({ example: '홍길동' })
  readonly name: string;

  @IsString()
  @ApiProperty({ example: 'abcde@gm.gist.ac.kr' })
  readonly email: string;

  @IsString()
  @ApiProperty({ example: '20250000' })
  readonly studentId: string;

  @IsArray()
  @ApiProperty({ type: [PostDto] })
  readonly posts: PostDto[];

  @IsString()
  @ApiProperty({ example: 'ACTIVE' })
  readonly status: UserStatus;
}
