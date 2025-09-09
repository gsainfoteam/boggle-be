import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SubjectDto {
  @ApiProperty({ example: 'EC2000-00' })
  @IsString()
  readonly code: string;

  @ApiProperty({ example: '과목이름' })
  @IsString()
  readonly subject: string;
}
