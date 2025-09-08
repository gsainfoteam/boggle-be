import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ConnectedUser } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserPayload } from 'src/types/user-payload.type';

@Injectable()
export class ConnectedUserRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    userPayload: UserPayload,
    socketId: string,
  ): Promise<ConnectedUser> {
    try {
      return await this.prisma.connectedUser.create({
        data: {
          userId: userPayload.id,
          socketId: socketId,
          joinedAt: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new WsException(`Database error: ${error.message}`);
      }
      throw new WsException('Failed to create connected user');
    }
  }

  async delete(socketId: string): Promise<ConnectedUser> {
    try {
      return await this.prisma.connectedUser.delete({
        where: { socketId },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new WsException('Connected user not found');
      }
      throw new WsException('Failed to delete connected user');
    }
  }

  async deleteAll(): Promise<{ count: number }> {
    try {
      return await this.prisma.connectedUser.deleteMany();
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new WsException(`Database error: ${error.message}`);
      }
      throw new WsException('Failed to delete all connected users');
    }
  }

  async findByUserIds(userIds: string[]): Promise<ConnectedUser[]> {
    return await this.prisma.connectedUser.findMany({
      where: {
        userId: { in: userIds },
      },
    });
  }
}
