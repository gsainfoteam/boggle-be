import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  roomId: string;

  @ApiProperty({ required: true, example: 'Hello, this is a message.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @IsUUID()
  senderId: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({ example: ['abc', 'def'] })
  imageUrls?: string[];
}

export class DeleteMessageDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({ required: true, type: String, isArray: true })
  @IsArray()
  @IsUUID(4, { each: true })
  @IsNotEmpty()
  messageIds: string[];
}

export class MessageDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  roomId: string;

  @ApiProperty({ example: 'Hello, this is a message.' })
  content: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  senderId: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-02T00:00:00.000Z' })
  updatedAt: Date;
}

export class UpdateMessageDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  messageId: string;

  @ApiProperty({ required: true, example: 'Hello, this is a message.' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class FilterMessageDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  first?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  rows?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  filter?: string;

  @ApiProperty({ required: true })
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  roomId: string;
}
