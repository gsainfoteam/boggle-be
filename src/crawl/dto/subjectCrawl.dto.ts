import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SubjectCrawlDto {
  @IsString()
  @ApiProperty({ example: 'GS1000-1' })
  readonly code: string;

  @IsString()
  @ApiProperty({ example: 'John Doe' })
  readonly name: string;
}
