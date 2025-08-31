import { ApiProperty } from '@nestjs/swagger';
import { PostStatus, PostType, User } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { RoommatePostDto } from '../roommatePost.dto';

class publicUserDto {
  @IsString()
  @ApiProperty({ example: '70025914-2097-4eb1-9ebb-c2181f02b4f3' })
  readonly id: string;

  @IsString()
  @ApiProperty({ example: 'John Doe' })
  readonly name: string;
}

export class SearchDto {
  @ApiProperty({ description: 'Query string', example: 'roommate' })
  @IsString()
  q!: string;

  @ApiProperty({
    description: 'Limit value, 20 by default',
    example: '100',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({
    description: 'Offset value, 0 by default',
    example: '10',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
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
    description:
      'The user who authored the post. Exposes the full Prisma User model.',
  })
  @IsObject()
  @Transform(({ value }: { value: User }) => {
    return { id: value.id, name: value.name };
  })
  author!: publicUserDto | User;

  @ApiProperty({
    description:
      'A list of users participating in the post. Exposes the full Prisma User model.',
    type: [Object], // Using a generic object type for the array of Prisma types
  })
  participants!: { id: string; name: string }[];

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

  @ApiProperty({
    description:
      'Specific details for posts of type ROOMMATE. Exposes the full Prisma RoommateDetails model.',
    nullable: true,
  })
  @IsArray()
  @Transform(({ value }: { value: User[] }) =>
    value.map((user) => {
      return { id: user.id, name: user.name };
    }),
  )
  roommateDetails!: RoommatePostDto | null;

  @ApiProperty({
    description: "The ID of the post's author.",
    example: 'c1b2a3d4-e5f6-7890-1234-567890abcdef',
  })
  authorId!: string;

  @ApiProperty({
    description:
      'The current status of the post (e.g., open for participants or closed).',
    enum: PostStatus,
    example: PostStatus.OPEN,
  })
  status!: PostStatus;

  @ApiProperty({
    description: 'The relevance score of the search result, from 0 to 1.',
    example: 0.8734,
  })
  rank!: number;
}
