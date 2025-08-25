import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class RoommatePostDto {
  @IsNumber()
  @ApiProperty({ example: 20 })
  readonly age: number;

  @IsNumber()
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

  @IsString()
  @ApiProperty({ example: '22:00' })
  readonly sleepTime?: string | null;

  @IsString()
  @ApiProperty({ example: '08:00' })
  readonly wakeUpTime?: string | null;

  @IsString()
  @ApiProperty({ example: 'INTJ' })
  readonly mbti?: string | null;

  @IsBoolean()
  @ApiProperty({ example: true })
  readonly rmRefrigerator?: boolean | null;

  @IsBoolean()
  @ApiProperty({ example: true })
  readonly rmWifi?: boolean | null;

  @IsBoolean()
  @ApiProperty({ example: true })
  readonly rmSnoring?: boolean | null;

  @IsBoolean()
  @ApiProperty({ example: true })
  readonly rmSmoking?: boolean | null;
}
