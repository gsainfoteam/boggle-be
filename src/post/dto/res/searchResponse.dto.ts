import { ApiProperty } from '@nestjs/swagger';
import { SearchPostDto } from '../req/search.dto';
import { IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchResponseDto {
  @ApiProperty({ type: [SearchPostDto] })
  @IsArray()
  @Type(() => SearchPostDto)
  readonly posts!: SearchPostDto[];

  @ApiProperty()
  readonly offset!: number;

  @ApiProperty()
  readonly limit!: number;
}
