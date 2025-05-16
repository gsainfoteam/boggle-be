import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class uidDto {
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ example: '1' })
  readonly uid: number;
}
