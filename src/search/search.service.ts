import { Injectable } from '@nestjs/common';
import { SearchRepository } from './search.repository';
import { SearchDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(private readonly repo: SearchRepository) {}

  async search(dto: SearchDto) {
    return this.repo.webSearch(dto.q, { limit: dto.limit, offset: dto.offset });
  }
}
