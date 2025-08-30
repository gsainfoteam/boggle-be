import { ApiProperty } from '@nestjs/swagger';
import { Post, UserStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';
import { PostDto } from 'src/post/dto/res/post.dto';

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
  @Transform(({ value }: { value: Post[] }) =>
    value.map((post) => new PostDto(post)),
  )
  @ApiProperty({ type: [PostDto] })
  readonly posts: PostDto[] | Post[];

  @IsString()
  @ApiProperty({ example: 'ACTIVE' })
  readonly status: UserStatus;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
