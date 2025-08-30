import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchDto {
  @ApiProperty({ description: 'Query string', example: 'roommate' })
  @IsString()
  q!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;
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
