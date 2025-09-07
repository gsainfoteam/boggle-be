import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { z } from 'zod';
import { PostDto } from './post.dto';

export class basicUserDto {
  @IsString()
  @ApiProperty({ example: '70025914-2097-4eb1-9ebb-c2181f02b4f3' })
  readonly id: string;

  @IsString()
  @ApiProperty({ example: 'John Doe' })
  readonly name: string;
}

export const SearchRowSchema = z.object({
  id: z.string().uuid(),
  rank: z.number(),
  createdAt: z.coerce.date(),
  total: z.coerce.number(),
});

type SearchRow = z.infer<typeof SearchRowSchema>;

export class SearchRepoResponseDto {
  @ApiProperty({
    description: 'Parsed, Zod-validated FTS rows in relevance order.',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        rank: { type: 'number' },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        total: {
          type: 'number',
        },
      },
      required: ['id', 'rank', 'createdAt', 'total'],
    },
  })
  @IsArray()
  rows!: ReadonlyArray<SearchRow>;

  @ApiProperty({
    description: 'Hydrated posts aligned 1:1 and in the same order as `rows`.',
  })
  @IsArray()
  @Type(() => PostDto)
  posts!: ReadonlyArray<PostDto>;
}
