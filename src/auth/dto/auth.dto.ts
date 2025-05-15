import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthDto {
  @IsString()
  @ApiProperty({ example: 'abcde@gm.gist.ac.kr' })
  readonly email: string;

  @IsString()
  @ApiProperty({ example: 'abcde' })
  readonly password: string;
}
