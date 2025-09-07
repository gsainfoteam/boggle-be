import { Injectable } from '@nestjs/common';
import { CrawlRepository } from './crawl.repository';
import { SubjectCrawlDto } from './dto/subjectCrawl.dto';

@Injectable()
export class CrawlService {
  constructor(private readonly crawlRepository: CrawlRepository) {}

  async uploadSubjects(subjects: SubjectCrawlDto[]): Promise<boolean> {
    return true;
  }
}
