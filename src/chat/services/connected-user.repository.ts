import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ConnectedUser } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserPayload } from 'src/types/user-payload.type';

@Injectable()
export class ConnectedUserRepository {
  private readonly logger = new Logger('ConnectedUserRepository');

  constructor(private prisma: PrismaService) {}

  async create(userPayload: UserPayload, socketId: string) {
    try {
      return await this.prisma.connectedUser.create({
        data: {
          userId: userPayload.id,
          email: userPayload.email,
          socketId: socketId,
          joinedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Create failed for user ${userPayload.id}`,
        error.stack,
      );
      if (error instanceof PrismaClientKnownRequestError) {
        throw new WsException('Database error when creating a connected user');
      }
      throw new WsException('Unexpected error when creating a connected user');
    }
  }

  async delete(socketId: string) {
    return await this.prisma.connectedUser
      .delete({
        where: { socketId: socketId },
      })
      .catch((error) => {
        this.logger.error(`Delete failed for socket ${socketId}`, error.stack);
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new WsException('User not found');
          }
          throw new WsException(
            'Database error when deleting a connected user',
          );
        }
        throw new WsException(
          'Unexpected error when deleting a connected user',
        );
      });
  }

  async deleteAll() {
    try {
      return await this.prisma.connectedUser.deleteMany();
    } catch (error) {
      this.logger.error('Delete all failed', error.stack);
      if (error instanceof PrismaClientKnownRequestError) {
        throw new WsException(
          'Database error while deleting all connected users',
        );
      }
      throw new WsException(
        'Unexpected error when deleting all connected users',
      );
    }
  }

  async findByUserIds(userIds: string[]): Promise<ConnectedUser[]> {
    try {
      return await this.prisma.connectedUser.findMany({
        where: {
          userId: {
            in: userIds,
          },
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to find connected users by UUIDs: ${userIds.join(', ')}`,
        error.stack,
      );
      if (error instanceof PrismaClientKnownRequestError) {
        throw new WsException('Database error when fetching connected users.');
      }
      throw new WsException('Unexpected error when fetching connected users.');
    }
  }
}
