import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class updateUserDto {
  @IsString()
  @ApiProperty({ example: 'abcde' })
  readonly password: string;
}
