import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UserDto {
  @IsString()
  @ApiProperty({ example: '70025914-2097-4eb1-9ebb-c2181f02b4f3' })
  readonly id: string;

  @IsString()
  @ApiProperty({ example: 'John Doe' })
  readonly name: string;
}
