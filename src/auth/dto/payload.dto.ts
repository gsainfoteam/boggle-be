import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class PayloadDto {
  @IsNumber()
  @ApiProperty({ example: 'abcde' })
  readonly id: number;
}
