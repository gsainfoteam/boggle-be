import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class RegisterUserDto {

    @ApiProperty({ example: 'user@example.com' })
    @IsNotEmpty()
    readonly email: string;

    @ApiProperty({ example: 'Password' })
    @IsNotEmpty()
    readonly password: string;

    @ApiProperty({ example: 'This is username' })
    @IsNotEmpty()
    readonly name: string;

    @ApiProperty({ example: 'GIST Student ID' })
    @IsNotEmpty()
    readonly studentId :string;

    @ApiProperty({ example: 'Phone number' })
    @IsOptional()
    readonly phoneNumber: string;

    @ApiProperty({ example: 'Major' })
    @IsNotEmpty()
    readonly major:string;

    @ApiProperty({ example: 'Grade (e.g., freshman, sophomore...' }) 
    @IsOptional()
    readonly grade:string;
}       