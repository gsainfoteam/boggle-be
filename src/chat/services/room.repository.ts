import { PrismaService } from "src/prisma/prisma.service";
import { AssignUsersDto, CreateRoomDto, DeleteUsersDto, UpdateRoomDto } from "../dto/room.dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Injectable, Logger } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Room } from "@prisma/client";

@Injectable()
export class RoomRepository {
    private readonly logger = new Logger('RoomRepository');

    constructor(private prisma: PrismaService) { }

    async create({ name, hostId, roomType, participantsId }: CreateRoomDto) {
        try {

             const allMemberIds = [hostId, ...participantsId];

            return await this.prisma.room.create({
                data: {
                    hostId: hostId,
                    roomType: roomType,
                    name: name,
                    members: { connect: allMemberIds.map(id => ({ id: id }))},
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                this.logger.error(`Database error when creating room: ${error.message}`, error.stack);
                throw new WsException("Database error when creating room.");
            }
            this.logger.error(`Unexpected error when creating room: ${error.message}`, error.stack);
            throw new WsException("Unexpected error when creating room.");
        }
    }

    async findOne(roomId: string) {
        try {
            return await this.prisma.room.findUniqueOrThrow({
                where: {
                    id: roomId
                },
                include: {
                    members: true
                }
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new WsException('Room not found.');
                }
                this.logger.error(`Database error when finding room ${roomId}: ${error.message}`, error.stack);
                throw new WsException('Database error when finding room.');
            }
            this.logger.error(`Unexpected error when finding room ${roomId}: ${error.message}`, error.stack);
            throw new WsException('Unexpected error when finding room.');
        }
    }

    async update({ roomId, name, }: UpdateRoomDto) {
        try {
            return await this.prisma.room.update({
                where: { id: roomId },
                data: {
                    name: name,
                    updatedAt: new Date(),
                },
                include: {
                    members: true
                }
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new WsException('Room not found.');
                }
                this.logger.error(`Database error when updating room ${roomId}: ${error.message}`, error.stack);
                throw new WsException('Database error when updating room.');
            }
            this.logger.error(`Unexpected error when updating room ${roomId}: ${error.message}`, error.stack);
            throw new WsException('Unexpected error when updating room.');
        }
    }

    async delete(roomID: string) {
        try {
            return await this.prisma.room.delete({
                where: {
                    id: roomID
                },
                include: {
                    members: true
                }
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new WsException('Room not found.');
                }
                this.logger.error(`Database error when deleting room ${roomID}: ${error.message}`, error.stack);
                throw new WsException('Database error when deleting room.');
            }
            this.logger.error(`Unexpected error when deleting room ${roomID}: ${error.message}`, error.stack);
            throw new WsException('Unexpected error when deleting room.');
        }
    }

    async joinRoom(roomId: string, userId: string) {
        try {
            return await this.prisma.room.update({
                where: { id: roomId },
                data: {
                    members: {
                        connect: { id: userId }
                    }
                },
                include: {
                    members: true
                }
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new WsException('Room or user not found.');
                }
                this.logger.error(`Database error for user ${userId} joining room ${roomId}: ${error.message}`, error.stack);
                throw new WsException('Database error when joining room.');
            }
            this.logger.error(`Unexpected error for user ${userId} joining room ${roomId}: ${error.message}`, error.stack);
            throw new WsException('Unexpected error when joining room.');
        }
    }

    async leaveRoom(roomId: string, userId: string) {
        try {
            return await this.prisma.room.update({
                where: { id: roomId },
                data: {
                    members: {
                        disconnect: { id: userId }
                    }
                },
                include: {
                    members: true
                }
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === "P2025") {
                    throw new WsException('Room or user not found.');
                }
                this.logger.error(`Database error for user ${userId} leaving room ${roomId}: ${error.message}`, error.stack);
                throw new WsException('Database error when leaving room.');
            }
            this.logger.error(`Unexpected error for user ${userId} leaving room ${roomId}: ${error.message}`, error.stack);
            throw new WsException('Unexpected error when leaving room.');
        }
    }

    async findRoomsByUserId(userId: string): Promise<Room[]> {
        try {
            return await this.prisma.room.findMany({
                where: {
                    members: { 
                        some: { 
                            id: userId, 
                        },
                    },
                },
                include: {
                    members: true,
                },
                orderBy: {
                    updatedAt: 'desc',
                },
            });
        } catch (error) {
            this.logger.error(`Failed to find rooms for user ${userId}: ${error.message}`, error.stack);
            if (error instanceof PrismaClientKnownRequestError) {
                throw new WsException(`Database error when fetching rooms: ${error.message}`);
            }
            throw new WsException('Unexpected error when fetching user rooms.');
        }
    }

    async assignUsers({ roomId, participantsId }: AssignUsersDto) {
        try {
            return await this.prisma.room.update({
                where: { id: roomId },
                data: {
                    members: {
                        connect: participantsId.map((id) => ({ id: id }))
                    }
                },
                include: {
                    members: true
                }
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === "P2025") {
                    throw new WsException('Room or users not found.');
                }
                this.logger.error(`Database error assigning users to room ${roomId}: ${error.message}`, error.stack);
                throw new WsException('Database error when assigning users.');
            }
            this.logger.error(`Unexpected error assigning users to room ${roomId}: ${error.message}`, error.stack);
            throw new WsException('Unexpected error when assigning users.');
        }
    }

    async deleteUsers({roomId, participantsId}: DeleteUsersDto) {
        try {
            return await this.prisma.room.update({
                where: { id: roomId },
                data: {
                    members: {
                        disconnect: participantsId.map((id) => ({ id: id }))
                    }
                },
                include: {
                    members: true
                }
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new WsException('Room or user not found.');
                }
                this.logger.error(`Database error when removing users from room ${roomId}: ${error.message}`, error.stack);
                throw new WsException('Database error when removing user from room.');
            }
            this.logger.error(`Unexpected error when removing users from room ${roomId}: ${error.message}`, error.stack);
            throw new WsException('Unexpected error when removing user from room.');
        }
    }
}