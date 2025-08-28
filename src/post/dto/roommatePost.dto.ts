import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class RoommatePostDto {
  @IsNumber()
  @ApiProperty({ example: 20 })
  readonly age: number;

  @IsString()
  @ApiProperty({ example: 'male' })
  readonly gender: string;

  @IsNumber()
  @ApiProperty({ example: 1 })
  readonly grade: number;

  @IsString()
  @ApiProperty({ example: 'G100' })
  readonly room: string;

  @IsString()
  @ApiProperty({ example: '2025-1' })
  readonly semester: string;

  @IsBoolean()
  @ApiProperty({ example: true })
  readonly refrigerator: boolean;

  @IsBoolean()
  @ApiProperty({ example: true })
  readonly wifi: boolean;

  @IsBoolean()
  @ApiProperty({ example: true })
  readonly snoring: boolean;

  @IsBoolean()
  @ApiProperty({ example: true })
  readonly smoking: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '22:00' })
  readonly sleepTime?: string | null;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '08:00' })
  readonly wakeUpTime?: string | null;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'INTJ' })
  readonly mbti?: string | null;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true })
  readonly rmRefrigerator?: boolean | null;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true })
  readonly rmWifi?: boolean | null;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true })
  readonly rmSnoring?: boolean | null;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true })
  readonly rmSmoking?: boolean | null;
}
