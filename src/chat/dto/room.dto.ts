import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { MessageDto } from "./message.dto";

enum RoomTypeEnum {
  GROUP = "GROUP",
  PRIVATE = "PRIVATE",
}

export class CreateRoomDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Transform((value) => value.toString())
  type: RoomTypeEnum;

  @ApiProperty({ required: true, type: String, isArray: true })
  @IsNotEmpty()
  @IsUUID(undefined, { each: true, message: 'Each participant must have a valid UUID' })
  participantsId: string[];
}


export class AssignUsersDto{
    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    roomId: string;
    
    @ApiProperty({ required: true, type: String, isArray: true })
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    participantsId: string[];
}


export class DeleteRoomDto {
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    roomId: string;
}

export class UpdateRoomDto {
    @ApiProperty({ required: true })
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    roomId: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    name: string;

    @ApiProperty({ required: false, type:String, isArray: true })
    @IsNotEmpty()
    @IsOptional()
    @IsUUID(undefined, { each: true, message: 'Each participant must have a valid UUID' })
    participantsId: string[];
} 

export class RoomDetailDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    roomId: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    ownerId: string;

    @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ example: '2023-01-02T00:00:00.000Z' })
    updatedAt: Date;
}
