import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchDto {
  @ApiProperty({ description: 'Query string', example: 'roommate' })
  @IsString()
  q!: string;

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

export class SearchItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true })
  title!: string | null;

  @ApiProperty({ type: Number, format: 'float', example: 0.7321 })
  rank!: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
}

export class SearchResponseDto {
  @ApiProperty({ type: [SearchItemDto] })
  items!: SearchItemDto[];

  @ApiProperty()
  offset!: number;

  @ApiProperty()
  limit!: number;
}
