import { ApiProperty } from '@nestjs/swagger';
import { PostStatus, PostType, RoommateDetails, User } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

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
  id!: string;
  title!: string | null;
  content!: string;
  type!: PostType;
  tags!: string[];
  author!: User;
  participants!: User[];
  maxParticipants!: number;
  createdAt!: Date;
  deadline!: Date | null;
  imageUrls!: string[];
  roommateDetails!: RoommateDetails | null;
  authorId!: string;
  status!: PostStatus;
  rank!: number;
}
