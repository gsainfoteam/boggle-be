import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthorDto {
  @IsString()
  @ApiProperty({ example: '70025914-2097-4eb1-9ebb-c2181f02b4f3' })
  readonly uuid: string;

  @IsString()
  @ApiProperty({ example: 'name' })
  readonly name: string;
}
