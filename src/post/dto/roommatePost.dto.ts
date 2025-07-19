import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class RoommatePostDto {
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
  readonly sleepTime: string;

  @IsString()
  @ApiProperty({ example: '08:00' })
  readonly wakeUpTime: string;

  @IsString()
  @ApiProperty({ example: 'INTJ' })
  readonly mbti: string;

  @IsBoolean()
  @ApiProperty({ example: true })
  readonly rmRefrigerator: boolean;

  @IsBoolean()
  @ApiProperty({ example: true })
  readonly rmWifi: boolean;

  @IsBoolean()
  @ApiProperty({ example: true })
  readonly rmSnoring: boolean;

  @IsBoolean()
  @ApiProperty({ example: true })
  readonly rmSmoking: boolean;

  @IsString()
  @ApiProperty({ example: 'INTJ' })
  readonly rmMbti: string;
}
