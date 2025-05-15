import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshDto {
  @IsString()
  @ApiProperty({ example: 'abcde.abcde.abcde' })
  readonly refresh_token: string;
}
