import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { UserDto } from "src/auth/dto/user.dto";

export class CreateMessageDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  text: string;
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
  @ApiProperty({ example: '987fbc97-4bed-5078-9f07-9141ba07c9f3' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  roomId: string;

  @ApiProperty({ example: 'Hello, this is a message.' })
  text: string;

  @ApiProperty({ type: UserDto })
  creator: UserDto;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  createdBy: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  updatedBy: string;

  @ApiProperty({ example: '2023-01-02T00:00:00.000Z' })
  updatedAt: Date;
}


export class UpdateMessageDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  messageId: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  text: string;
}