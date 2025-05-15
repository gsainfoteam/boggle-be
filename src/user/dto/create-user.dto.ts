import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateUserDto {

    @ApiProperty({ example: 'This is username' })
    @IsNotEmpty()
    readonly name: string;

    @ApiProperty({ example: 'Create User - password' })
    @IsNotEmpty()
    readonly password: string;

}
