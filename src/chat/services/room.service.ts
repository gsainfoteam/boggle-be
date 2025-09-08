import { RoomRepository } from './room.repository';
import { Injectable, Logger } from '@nestjs/common';
import {
  AssignUsersDto,
  CreateRoomDto,
  DeleteUsersDto,
  UpdateRoomDto,
} from '../dto/room.dto';
import { Room, User } from '@prisma/client';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class RoomService {
  private readonly logger = new Logger('RoomService');

  constructor(private roomRepository: RoomRepository) {}

  async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
    try {
      const room = await this.roomRepository.create(createRoomDto);
      return room;
    } catch (error) {
      if (error instanceof WsException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : String(error);

      this.logger.error(
        `Unexpected error while creating room: ${errorMessage}`,
        errorStack,
      );
      throw new WsException('Unexpected error while creating room.');
    }
  }

  async deleteRoom(
    uuid: string,
    userId: string,
  ): Promise<Room & { members: User[] }> {
    try {
      const room = await this.roomRepository.findOne(uuid);
      if (userId !== room.hostId) {
        this.logger.warn(
          `User ${userId} attempted to delete room ${uuid} but is not the host.`,
        );
        throw new WsException('Only the host is allowed to delete the room.');
      }
      return await this.roomRepository.softDelete(uuid);
    } catch (error) {
      if (error instanceof WsException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : String(error);

      this.logger.error(
        `Unexpected error while deleting room ${uuid} by user ${userId}: ${errorMessage}`,
        errorStack,
      );
      throw new WsException('Unexpected error while deleting room.');
    }
  }

  async findRoomById(uuid: string): Promise<Room & { members: User[] }> {
    try {
      return await this.roomRepository.findOne(uuid);
    } catch (error) {
      if (error instanceof WsException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : String(error);

      this.logger.error(
        `Unexpected error when finding room by ID ${uuid}: ${errorMessage}`,
        errorStack,
      );
      throw new WsException('Unexpected error when retrieving room.');
    }
  }

  async findByUserId(userId: string): Promise<Room[]> {
    try {
      const rooms = await this.roomRepository.findRoomsByUserId(userId);
      this.logger.log(`Found ${rooms.length} rooms for user ${userId}`);
      return rooms;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : String(error);

      this.logger.error(
        `Error finding rooms for user ${userId}: ${errorMessage}`,
        errorStack,
      );
      if (error instanceof WsException) {
        throw error;
      }
      throw new WsException('Failed to retrieve user rooms.');
    }
  }

  async updateRoom(
    updateRoomDto: UpdateRoomDto,
    userId: string,
  ): Promise<Room & { members: User[] }> {
    try {
      const existingRoom = await this.roomRepository.findOne(
        updateRoomDto.roomId,
      );

      if (existingRoom.hostId !== userId) {
        this.logger.warn(
          `User ${userId} attempted to update room ${updateRoomDto.roomId} but is not the host.`,
        );
        throw new WsException('Only the host is allowed to update the room.');
      }

      return await this.roomRepository.update(updateRoomDto);
    } catch (error) {
      if (error instanceof WsException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : String(error);

      this.logger.error(
        `Unexpected error when updating room ${updateRoomDto.roomId} by user ${userId}: ${errorMessage}`,
        errorStack,
      );
      throw new WsException('Unexpected error when updating room.');
    }
  }

  async joinRoom(
    roomId: string,
    userId: string,
  ): Promise<Room & { members: User[] }> {
    try {
      return await this.roomRepository.joinRoom(roomId, userId);
    } catch (error) {
      if (error instanceof WsException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : String(error);

      this.logger.error(
        `Unexpected error for user ${userId} joining room ${roomId}: ${errorMessage}`,
        errorStack,
      );
      throw new WsException('Unexpected error when joining room.');
    }
  }

  async leaveRoom(
    roomId: string,
    userId: string,
  ): Promise<Room & { members: User[] }> {
    try {
      return await this.roomRepository.leaveRoom(roomId, userId);
    } catch (error) {
      if (error instanceof WsException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : String(error);

      this.logger.error(
        `Unexpected error for user ${userId} leaving room ${roomId}: ${errorMessage}`,
        errorStack,
      );
      throw new WsException('Unexpected error when leaving room.');
    }
  }

  async assignUsers(
    assignUsersDto: AssignUsersDto,
    userId: string,
  ): Promise<Room & { members: User[] }> {
    try {
      const room = await this.roomRepository.findOne(assignUsersDto.roomId);
      if (userId !== room.hostId) {
        this.logger.warn(
          `User ${userId} attempted to assign users to room ${assignUsersDto.roomId} but is not the host.`,
        );
        throw new WsException('Only the host is allowed to assign users.');
      }
      return await this.roomRepository.assignUsers(assignUsersDto);
    } catch (error) {
      if (error instanceof WsException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : String(error);

      this.logger.error(
        `Unexpected error when assigning users to room ${assignUsersDto.roomId} by user ${userId}: ${errorMessage}`,
        errorStack,
      );
      throw new WsException('Unexpected error when assigning users.');
    }
  }

  async deleteUsers(
    deleteUsersDto: DeleteUsersDto,
    userId: string,
  ): Promise<Room & { members: User[] }> {
    try {
      const room = await this.roomRepository.findOne(deleteUsersDto.roomId);
      if (userId !== room.hostId) {
        this.logger.warn(
          `User ${userId} attempted to delete users from room ${deleteUsersDto.roomId} but is not the host.`,
        );
        throw new WsException('Only the host is allowed to delete users.');
      }
      return await this.roomRepository.deleteUsers(deleteUsersDto);
    } catch (error) {
      if (error instanceof WsException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : String(error);

      this.logger.error(
        `Unexpected error when deleting users from room ${deleteUsersDto.roomId} by user ${userId}: ${errorMessage}`,
        errorStack,
      );
      throw new WsException('Unexpected error when deleting users.');
    }
  }
}
