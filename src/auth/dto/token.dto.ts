import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TokenDto {
  @IsString()
  @ApiProperty({ example: '2d87779b-7632-4163-afa0-5062d83e325b' })
  readonly uuid: string;

  @IsString()
  @ApiProperty({ example: 'abc' })
  readonly access_token: string;

  @IsString()
  @ApiProperty({ example: 'abc' })
  readonly refresh_token: string;
}
