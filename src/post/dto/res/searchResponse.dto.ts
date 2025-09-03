import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PostStatus, PostType, User } from '@prisma/client';
import { RoommatePostDto } from '../roommatePost.dto';
import { z } from 'zod';
import { PostDto } from './post.dto';
export class publicUserDto {
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
  posts!: ReadonlyArray<SearchPostDto>;
}

export class SearchPostDto {
  @ApiProperty({
    description: 'The unique identifier for the post.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsString()
  id!: string;

  @ApiProperty({
    description: 'The title of the post.',
    example: 'Looking for a study group for Advanced Algorithms!',
    nullable: true,
  })
  @IsString()
  title!: string | null;

  @ApiProperty({
    description: 'The main content of the post in detail.',
    example:
      'We meet twice a week to go over lectures and solve problems. Looking for two more members.',
  })
  @IsString()
  content!: string;

  @ApiProperty({
    description: 'The category or type of the post.',
    enum: PostType, // Creates a dropdown in Swagger UI
    example: PostType.STUDY,
  })
  type!: PostType;

  @ApiProperty({
    description: 'A list of relevant tags for the post.',
    type: [String],
    example: ['computer-science', 'algorithms', 'urgent'],
  })
  tags!: string[];

  @ApiProperty({
    description: 'The user who authored the post.',
  })
  @IsObject()
  @Transform(({ value }: { value: User }) => {
    return { id: value.id, name: value.name };
  })
  author!: publicUserDto;

  @ApiProperty({
    description: 'A list of participants in the post.',
    type: [publicUserDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => publicUserDto)
  @Transform(({ value }: { value: User[] }) =>
    value.map((user) => {
      return { id: user.id, name: user.name };
    }),
  )
  participants!: publicUserDto[] | User[];

  @ApiProperty({
    description:
      'The maximum number of participants allowed in the group or project.',
    example: 4,
  })
  maxParticipants!: number;

  @ApiProperty({
    description: 'The date and time when the post was created.',
    example: '2025-08-31T10:44:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'An optional deadline for the post (e.g., for applications).',
    example: '2025-09-15T23:59:59.000Z',
    nullable: true,
  })
  deadline!: Date | null;

  @ApiProperty({
    description: 'A list of URLs for images attached to the post.',
    type: [String],
    example: ['https://example.com/image1.jpg'],
  })
  imageUrls!: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => RoommatePostDto)
  @ApiPropertyOptional({ type: RoommatePostDto })
  readonly roommateDetails: RoommatePostDto | null;

  @ApiProperty({
    description:
      'The current status of the post (e.g., open for participants or closed).',
    enum: PostStatus,
    example: PostStatus.OPEN,
  })
  status!: PostStatus;

  constructor(partial: Partial<SearchPostDto>) {
    Object.assign(this, partial);
  }
}

export class SearchResponseDto {
  @ApiProperty({ type: [SearchPostDto] })
  @IsArray()
  @Type(() => SearchPostDto)
  readonly posts!: SearchPostDto[];

  @IsNumber()
  @ApiProperty({ example: 1 })
  readonly total: number;
}
