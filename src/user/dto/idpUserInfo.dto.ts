import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class IdpUserInfoDto {
  @IsString()
  @ApiProperty({ example: 'abcde' })
  readonly sub: string;

  @IsString()
  @ApiProperty({ example: '홍길동' })
  readonly name: string;

  @IsString()
  @ApiProperty({ example: 'email@gm.gist.ac.kr' })
  readonly email: string;

  @IsString()
  @ApiProperty({ example: '20250000' })
  readonly student_id: string;
}
