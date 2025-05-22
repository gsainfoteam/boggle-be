import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';
import { PostDto } from 'src/post/dto/post.dto';

export class UserDto {
  @IsString()
  @ApiProperty({ example: '2d87779b-7632-4163-afa0-5062d83e325b' })
  readonly uuid: string;

  @IsString()
  @ApiProperty({ example: '홍길동' })
  readonly name: string;

  @IsString()
  @ApiProperty({ example: 'abcde@gm.gist.ac.kr' })
  readonly email: string;

  @IsString()
  @ApiProperty({ example: 'abcde' })
  readonly password: string;

  @IsNumber()
  @ApiProperty({ example: '20250000' })
  readonly studentId: number;

  @IsString()
  @ApiProperty({ example: '전자전기컴퓨터공학부' })
  readonly major: string;

  @IsArray()
  @ApiProperty({ type: [PostDto] })
  readonly posts: PostDto[];
}
