import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @ApiProperty({ example: 'Q7BsCkHPTAeaAQkgmL5L7KZ9GASIdtfpD02Zqxaq-ds' })
  readonly code: string;
}
