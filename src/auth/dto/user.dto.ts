import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class UserDto {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @ApiProperty({ example: '1' })
  readonly uid: number;

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
  @Transform(({ value }) => Number(value))
  @ApiProperty({ example: '20250000' })
  readonly studentId: number;

  @IsString()
  @ApiProperty({ example: '전자전기컴퓨터공학부' })
  readonly major: string;
}
