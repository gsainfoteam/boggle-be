import { PrismaService } from 'src/prisma/prisma.service';
import {
  AssignUsersDto,
  CreateRoomDto,
  DeleteUsersDto,
  UpdateRoomDto,
} from '../dto/room.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Room } from '@prisma/client';

@Injectable()
export class RoomRepository {
  constructor(private prisma: PrismaService) {}

  private readonly baseWhereDeleted = {
    isDeleted: false,
    deletedAt: null,
  };

  async create({ name, hostId, roomType, participantsId }: CreateRoomDto) {
    try {
      const allMemberIds = [hostId, ...participantsId];

      return await this.prisma.room.create({
        data: {
          hostId: hostId,
          roomType: roomType,
          name: name,
          members: { connect: allMemberIds.map((id) => ({ id: id })) },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new WsException('Database error when creating room.');
      }
      throw new WsException('Unexpected error when creating room.');
    }
  }

  async findOne(roomId: string) {
    try {
      return await this.prisma.room.findUniqueOrThrow({
        where: {
          id: roomId,
          ...this.baseWhereDeleted,
        },
        include: {
          members: true,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new WsException('Room not found.');
        }
        throw new WsException('Database error when finding room.');
      }
      throw new WsException('Unexpected error when finding room.');
    }
  }

  async update({ roomId, name }: UpdateRoomDto) {
    try {
      return await this.prisma.room.update({
        where: { id: roomId, ...this.baseWhereDeleted },
        data: {
          name: name,
          updatedAt: new Date(),
        },
        include: {
          members: true,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new WsException('Room not found.');
        }
        throw new WsException('Database error when updating room.');
      }
      throw new WsException('Unexpected error when updating room.');
    }
  }

  async hardDelete(roomId: string) {
    try {
      return await this.prisma.room.delete({
        where: {
          id: roomId,
        },
        include: {
          members: true,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new WsException('Room not found.');
        }
        throw new WsException('Database error when deleting room.');
      }
      throw new WsException('Unexpected error when deleting room.');
    }
  }

  async softDelete(roomId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.message.updateMany({
          where: {
            roomId: roomId,
            isDeleted: false,
          },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
          },
        });

        const deletedRoom = await tx.room.update({
          where: {
            id: roomId,
            ...this.baseWhereDeleted,
          },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
          },
          include: {
            members: true,
          },
        });

        return deletedRoom;
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new WsException('Room not found.');
        }
        throw new WsException('Database error when deleting room.');
      }
      throw new WsException('Unexpected error when deleting room.');
    }
  }

  async restore(roomId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const restoredRoom = await tx.room.update({
          where: {
            id: roomId,
            isDeleted: true,
          },
          data: {
            isDeleted: false,
            deletedAt: null,
          },
          include: {
            members: true,
          },
        });

        await tx.message.updateMany({
          where: {
            roomId: roomId,
            isDeleted: true,
          },
          data: {
            isDeleted: false,
            deletedAt: null,
          },
        });

        return restoredRoom;
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new WsException('Room not found.');
        }
        throw new WsException('Database error when restoring room.');
      }
      throw new WsException('Unexpected error when restoring room.');
    }
  }

  async joinRoom(roomId: string, userId: string) {
    try {
      return await this.prisma.room.update({
        where: { id: roomId, ...this.baseWhereDeleted },
        data: {
          members: {
            connect: { id: userId },
          },
        },
        include: {
          members: true,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new WsException('Room or user not found.');
        }
        throw new WsException('Database error when joining room.');
      }
      throw new WsException('Unexpected error when joining room.');
    }
  }

  async leaveRoom(roomId: string, userId: string) {
    try {
      return await this.prisma.room.update({
        where: { id: roomId, ...this.baseWhereDeleted },
        data: {
          members: {
            disconnect: { id: userId },
          },
        },
        include: {
          members: true,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new WsException('Room or user not found.');
        }
        throw new WsException('Database error when leaving room.');
      }
      throw new WsException('Unexpected error when leaving room.');
    }
  }

  async findRoomsByUserId(userId: string): Promise<Room[]> {
    try {
      return await this.prisma.room.findMany({
        where: {
          ...this.baseWhereDeleted,
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
      if (error instanceof PrismaClientKnownRequestError) {
        throw new WsException(
          `Database error when fetching rooms: ${error.message}`,
        );
      }
      throw new WsException('Unexpected error when fetching user rooms.');
    }
  }

  async assignUsers({ roomId, participantsId }: AssignUsersDto) {
    try {
      return await this.prisma.room.update({
        where: { id: roomId, ...this.baseWhereDeleted },
        data: {
          members: {
            connect: participantsId.map((id) => ({ id: id })),
          },
        },
        include: {
          members: true,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new WsException('Room or users not found.');
        }
        throw new WsException('Database error when assigning users.');
      }
      throw new WsException('Unexpected error when assigning users.');
    }
  }

  async deleteUsers({ roomId, participantsId }: DeleteUsersDto) {
    try {
      return await this.prisma.room.update({
        where: { id: roomId, ...this.baseWhereDeleted },
        data: {
          members: {
            disconnect: participantsId.map((id) => ({ id: id })),
          },
        },
        include: {
          members: true,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new WsException('Room or user not found.');
        }
        throw new WsException('Database error when removing user from room.');
      }
      throw new WsException('Unexpected error when removing user from room.');
    }
  }
}
