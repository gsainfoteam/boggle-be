import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { RoomTypeEnum } from "../common/enums/room-type.enum";

export class CreateRoomDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  hostId: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true, enum: RoomTypeEnum })
  @IsNotEmpty()
  romType: RoomTypeEnum;

  @ApiProperty({ required: false, type: String, isArray: true })
  @IsNotEmpty()
  @IsUUID(undefined, { each: true, message: 'Each participant must have a valid UUID' })
  participantsId: string[];
}


export class AssignUsersDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  roomId: string;

  @ApiProperty({ required: true, type: String, isArray: true })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsUUID(undefined, { each: true, message: 'Each participant must have a valid UUID' })
  participantsId: string[];
}


export class DeleteUsersDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  roomId: string;

  @ApiProperty({ required: true, type: String, isArray: true })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsUUID(undefined, { each: true, message: 'Each participant must have a valid UUID' })
  participantsId: string[];
}


export class DeleteRoomDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsUUID()
  @IsOptional()
  @IsNotEmpty()
  hostId: string;

  @ApiProperty({ required: true })
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
}
