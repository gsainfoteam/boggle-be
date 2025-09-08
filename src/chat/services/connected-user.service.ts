import { Injectable, Logger } from '@nestjs/common';
import { ConnectedUserRepository } from './connected-user.repository';
import { ConnectedUser } from '@prisma/client';
import { WsException } from '@nestjs/websockets';
import { UserPayload } from 'src/types/user-payload.type';

@Injectable()
export class ConnectedUserService {
  private readonly logger = new Logger(ConnectedUserService.name);

  constructor(private connectedUserRepository: ConnectedUserRepository) {}

  async createConnectedUser(
    userPayload: UserPayload,
    socketId: string,
  ): Promise<ConnectedUser> {
    try {
      return await this.connectedUserRepository.create(userPayload, socketId);
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : String(error);
      this.logger.error(
        `Failed to create connected user for ${userPayload.id}`,
        errorStack,
      );
      throw error;
    }
  }

  async deleteConnectedUser(socketId: string): Promise<ConnectedUser> {
    try {
      return await this.connectedUserRepository.delete(socketId);
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : String(error);
      this.logger.error(
        `Failed to delete connected user ${socketId}`,
        errorStack,
      );
      throw error;
    }
  }

  async deleteAllUsers(): Promise<{ count: number }> {
    try {
      const result = await this.connectedUserRepository.deleteAll();
      this.logger.log(`Deleted ${result.count} connected users`);
      return result;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : String(error);
      this.logger.error('Failed to delete all connected users', errorStack);
      throw new WsException('Failed to delete all connected users');
    }
  }

  async findConnectedUsersByUserIds(
    userIds: string[],
  ): Promise<ConnectedUser[]> {
    if (!userIds?.length) {
      return [];
    }

    try {
      return await this.connectedUserRepository.findByUserIds(userIds);
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : String(error);
      this.logger.error(
        `Failed to find connected users for IDs: ${userIds.join(', ')}`,
        errorStack,
      );
      throw new WsException('Failed to retrieve connected users');
    }
  }
}
