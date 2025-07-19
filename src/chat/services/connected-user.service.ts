import { Injectable, Logger } from '@nestjs/common';
import { ConnectedUserRepository } from './connected-user.repository';
import { ConnectedUser, User } from '@prisma/client';
import { WsException } from '@nestjs/websockets';
import { UserPayload } from 'src/types/user-payload.type';

@Injectable()
export class ConnectedUserService {
  private readonly logger = new Logger('ConnectedUserService');
  constructor(private connectedUserRepository: ConnectedUserRepository) {}

  async createConnectedUser(
    userPayload: UserPayload,
    socketId: string,
  ): Promise<ConnectedUser> {
    if (!userPayload.uuid) {
      throw new WsException('User id is required');
    }

    try {
      const newuser = await this.connectedUserRepository.create(
        userPayload,
        socketId,
      );
      return newuser;
    } catch (error) {
      this.logger.error('Create failed', error.stack);
      if (error instanceof WsException) {
        throw error;
      }
      throw new WsException('Unexpected error while creating a connected user');
    }
  }

  async deleteConnectedUser(socketId: string) {
    try {
      return await this.connectedUserRepository.delete(socketId);
    } catch (error) {
      this.logger.error('Delete failed', error.stack);
      throw new WsException('Unexpected error when deleting a connected user');
    }
  }

  async deleteAllUsers() {
    try {
      return await this.connectedUserRepository.deleteAll();
    } catch (error) {
      this.logger.error('Delete all failed', error.stack);
      throw new WsException(
        'Unexpected error when deleting all connected users',
      );
    }
  }

  async findConnectedUsersByUserIds(
    userIds: string[],
  ): Promise<ConnectedUser[]> {
    if (!userIds || userIds.length === 0) {
      return [];
    }
    try {
      return await this.connectedUserRepository.findByUserIds(userIds);
    } catch (error) {
      this.logger.error(
        `Error finding connected users by IDs ${userIds.join(', ')}: ${error.message}`,
        error.stack,
      );
      if (error instanceof WsException) {
        throw error;
      }
      throw new WsException(
        'Failed to retrieve connected users for notification.',
      );
    }
  }
}
