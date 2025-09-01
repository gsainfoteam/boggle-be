import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchDto {
  @ApiProperty({ description: 'Query string', example: 'roommate' })
  @IsString()
  query!: string;

  @ApiProperty({
    description: 'Limit value, 20 by default',
    example: '100',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({
    description: 'Offset value, 0 by default',
    example: '10',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
