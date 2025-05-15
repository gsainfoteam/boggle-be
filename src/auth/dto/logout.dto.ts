import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LogoutDto {
  @IsString()
  @ApiProperty({ example: 'abcde.abcde.abcde' })
  readonly access_token: string;
}
