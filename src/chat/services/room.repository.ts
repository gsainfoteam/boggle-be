import { PrismaService } from "src/prisma/prisma.service";
import { AssignUsersDto, CreateRoomDto, UpdateRoomDto } from "../dto/room.dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RoomRepository {
    constructor(private prisma: PrismaService) { }

    async create({ name, hostId, roomType, participantsId }: CreateRoomDto) {
         return await this.prisma.room.create({
            data: {
                hostId: hostId,
                roomType: roomType,
                name: name,
                members: { connect: participantsId.map(id => ({ uuid: id })) },
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        })
    }

    async findOne(roomId: string) {
        return await this.prisma.room.findUniqueOrThrow({
            where: {
                uuid: roomId
            }
        }).catch((error) => {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new Error('Room not found');
                }
                throw new Error('Database error')
            }
            throw new Error('Internal server error')
        })
    }


    async update({ roomId, name, participantsId, hostId }: UpdateRoomDto) {
        return await this.prisma.room.update({
            where: { uuid: roomId },
            data: {
                name: name,
                members: {
                    connect: participantsId.map((id) => ({ uuid: id })),
                },
                hostId: hostId
            }
        }).catch((error) => {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new Error('Room not found');
                }
                throw new Error('Database error')
            }
            throw new Error('Internal server error')
        })
    }

    async delete(roomID: string) {
        return await this.prisma.room.delete({
            where: {
                uuid: roomID
            },
        }).catch((error) => {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new Error('Room not found');
                }
                throw new Error('Database error')
            }
            throw new Error('Internal server error')
        })
    }

    async joinRoom(roomId: string, userId: string) {
        return await this.prisma.room.update({
            where: { uuid: roomId },
            data: {
                members: {
                    connect: { uuid: userId }
                }
            }
        }).catch((error) => {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new Error('Room not found');
                }
                throw new Error('Database error')
            }
            throw new Error('Internal server error')
        })
    }

    async leaveRoom(roomId: string, userId: string) {
        return await this.prisma.room.update({
            where: { uuid: roomId },
            data: {
                members: {
                    disconnect: { uuid: userId }
                }
            }
        }).catch((error) => {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === "2025") {
                    throw new Error('Room not found');
                }
                throw new Error('Database error');
            }
            throw new Error('Internal server error')
        })
    }


    async assignUsers({roomId, participantsId} : AssignUsersDto) {
        return await this.prisma.room.update({
            where: { uuid: roomId },
            data: {
                members: {
                    connect: participantsId.map((id) => ({uuid: id}))
                }
            }
        }).catch((error) => {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === "2025") {
                    throw new Error('Room not found');
                }
                throw new Error('Database error');
            }
            throw new Error('Internal server error')
        })
    }
}