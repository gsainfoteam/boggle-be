import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SearchDto, SearchResponseDto } from './dto/search.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Full-text search with offset pagination' })
  @ApiOkResponse({ description: 'Search results', type: SearchResponseDto })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async search(@Query() searchDto: SearchDto): Promise<SearchResponseDto> {
    const { q, limit, offset } = searchDto;
    const trimmed = (q ?? '').trim();
    if (!trimmed) return { items: [], offset, limit };
    const items = await this.searchService.search({ ...searchDto, q: trimmed });
    return { items, offset, limit };
  }
}
