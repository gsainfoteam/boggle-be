import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TokenDto {
  @IsString()
  @ApiProperty({ example: 'abc' })
  readonly accessToken: string;

  @IsString()
  @ApiProperty({ example: 'abc' })
  readonly refreshToken: string;
}
