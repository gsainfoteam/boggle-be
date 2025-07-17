import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PostIdDto {
  @IsString()
  @ApiProperty({ example: '70025914-2097-4eb1-9ebb-c2181f02b4f3' })
  readonly id: string;
}
