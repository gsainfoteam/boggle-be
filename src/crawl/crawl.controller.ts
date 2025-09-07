import { Body, Controller, Post } from '@nestjs/common';
import { CrawlService } from './crawl.service';
import {
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SubjectCrawlDto } from './dto/subjectCrawl.dto';

@Controller('crawl')
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) {}

  @Post('subject')
  @ApiOperation({
    summary: 'Upload Subject Info',
    description: 'Upload Subject Json data',
  })
  @ApiBody({ type: [SubjectCrawlDto] })
  @ApiOkResponse({
    type: Boolean,
    description: 'result',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async createPost(@Body() subjects: SubjectCrawlDto[]): Promise<boolean> {
    return await this.crawlService.uploadSubjects(subjects);
  }
}
