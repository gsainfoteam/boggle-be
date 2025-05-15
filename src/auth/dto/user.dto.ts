import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class UserDto {
  @IsNumber()
  @ApiProperty({ example: '1' })
  readonly id: number;

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
  readonly studentID: number;

  @IsString()
  @ApiProperty({ example: '전자전기컴퓨터공학부' })
  readonly major: string;
}
