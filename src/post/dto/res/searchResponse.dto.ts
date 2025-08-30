import { ApiProperty } from '@nestjs/swagger';
import { SearchPostDto } from '../req/search.dto';

export class SearchResponseDto {
  @ApiProperty({ type: [SearchPostDto] })
  posts!: SearchPostDto[];

  @ApiProperty()
  offset!: number;

  @ApiProperty()
  limit!: number;
}
