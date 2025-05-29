import { PrismaService } from "src/prisma/prisma.service";
import { AssignUsersDto, CreateRoomDto, UpdateRoomDto } from "../dto/room.dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Injectable, Logger } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class RoomRepository {
    private readonly logger = new Logger('RoomRepository');

    constructor(private prisma: PrismaService) { }

    async create({ name, hostId, roomType, participantsId }: CreateRoomDto) {
        try {
            return await this.prisma.room.create({
                data: {
                    hostId: hostId,
                    roomType: roomType,
                    name: name,
                    members: { connect: participantsId.map(id => ({ uuid: id })) },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
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
                    uuid: roomId
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

    async update({ roomId, name, participantsId, hostId }: UpdateRoomDto) {
        try {
            return await this.prisma.room.update({
                where: { uuid: roomId },
                data: {
                    name: name,
                    members: {
                        connect: participantsId.map((id) => ({ uuid: id })),
                    },
                    hostId: hostId
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
                    uuid: roomID
                },
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
                where: { uuid: roomId },
                data: {
                    members: {
                        connect: { uuid: userId }
                    }
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
                where: { uuid: roomId },
                data: {
                    members: {
                        disconnect: { uuid: userId }
                    }
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

    async assignUsers({ roomId, participantsId }: AssignUsersDto) {
        try {
            return await this.prisma.room.update({
                where: { uuid: roomId },
                data: {
                    members: {
                        connect: participantsId.map((id) => ({ uuid: id }))
                    }
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
}