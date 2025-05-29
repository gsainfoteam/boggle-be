import { RoomRepository } from "./room.repository";
import { Injectable, Logger } from "@nestjs/common";
import { AssignUsersDto, CreateRoomDto, UpdateRoomDto } from "../dto/room.dto";
import { Room, User } from "@prisma/client";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class RoomService {
    private readonly logger = new Logger("RoomService");

    constructor(private roomRepository: RoomRepository) { }

    async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
        try {
            const room = await this.roomRepository.create(createRoomDto);
            return room;
        } catch (error) {
            if (error instanceof WsException) {
                throw error;
            }
            this.logger.error(`Unexpected error while creating room: ${error.message}`, error.stack);
            throw new WsException("Unexpected error while creating room.");
        }
    }

    async deleteRoom(uuid: string, user: User): Promise<Room & { members: User[] }> {
        try {
            const room = await this.roomRepository.findOne(uuid);
            if (user.uuid !== room.hostId) {
                this.logger.warn(`User ${user.uuid} attempted to delete room ${uuid} but is not the host.`);
                throw new WsException("Only the host is allowed to delete the room.");
            }
            return await this.roomRepository.delete(uuid);
        } catch (error) {
            if (error instanceof WsException) {
                throw error;
            }
            this.logger.error(`Unexpected error while deleting room ${uuid} by user ${user.uuid}: ${error.message}`, error.stack);
            throw new WsException("Unexpected error while deleting room.");
        }
    }

    async findRoomById(uuid: string): Promise<Room & { members: User[] }> {
        try {
            return await this.roomRepository.findOne(uuid);
        } catch (error) {
            if (error instanceof WsException) {
                throw error;
            }
            this.logger.error(`Unexpected error when finding room by ID ${uuid}: ${error.message}`, error.stack);
            throw new WsException("Unexpected error when retrieving room.");
        }
    }

    async findByUserId(userId: string): Promise<Room[]> {
        try {
            const rooms = await this.roomRepository.findRoomsByUserId(userId);
            this.logger.log(`Found ${rooms.length} rooms for user ${userId}`);
            return rooms;
        } catch (error) {
            this.logger.error(`Error finding rooms for user ${userId}: ${error.message}`, error.stack);
            if (error instanceof WsException) {
                throw error; 
            }
            throw new WsException('Failed to retrieve user rooms.'); 
        }
    }

    async updateRoom(updateRoomDto: UpdateRoomDto, user: User): Promise<Room & { members: User[] }> {
        try {
            const existingRoom = await this.roomRepository.findOne(updateRoomDto.roomId);

            if (existingRoom.hostId !== user.uuid) {
                this.logger.warn(`User ${user.uuid} attempted to update room ${updateRoomDto.roomId} but is not the host.`);
                throw new WsException("Only the host is allowed to update the room.");
            }

            return await this.roomRepository.update(updateRoomDto);
        } catch (error) {
            if (error instanceof WsException) {
                throw error;
            }
            this.logger.error(`Unexpected error when updating room ${updateRoomDto.roomId} by user ${user.uuid}: ${error.message}`, error.stack);
            throw new WsException("Unexpected error when updating room.");
        }
    }

    async joinRoom(roomId: string, user: User): Promise<Room> {
        try {
            return await this.roomRepository.joinRoom(roomId, user.uuid);
        } catch (error) {
            if (error instanceof WsException) {
                throw error;
            }
            this.logger.error(`Unexpected error for user ${user.uuid} joining room ${roomId}: ${error.message}`, error.stack);
            throw new WsException("Unexpected error when joining room.");
        }
    }

    async leaveRoom(roomId: string, user: User): Promise<Room> {
        try {
            return await this.roomRepository.leaveRoom(roomId, user.uuid);
        } catch (error) {
            if (error instanceof WsException) {
                throw error;
            }
            this.logger.error(`Unexpected error for user ${user.uuid} leaving room ${roomId}: ${error.message}`, error.stack);
            throw new WsException("Unexpected error when leaving room.");
        }
    }

    async assignUsers(assignUsersDto: AssignUsersDto, user: User): Promise<Room> {
        try {
            const room = await this.roomRepository.findOne(assignUsersDto.roomId);
            if (user.uuid !== room.hostId) {
                this.logger.warn(`User ${user.uuid} attempted to assign users to room ${assignUsersDto.roomId} but is not the host.`);
                throw new WsException("Only the host is allowed to assign users.");
            }
            return await this.roomRepository.assignUsers(assignUsersDto);
        } catch (error) {
            if (error instanceof WsException) {
                throw error;
            }
            this.logger.error(`Unexpected error when assigning users to room ${assignUsersDto.roomId} by user ${user.uuid}: ${error.message}`, error.stack);
            throw new WsException("Unexpected error when assigning users.");
        }
    }
}