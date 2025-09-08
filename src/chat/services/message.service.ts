import { Injectable, Logger } from '@nestjs/common';
import {
  CreateMessageDto,
  DeleteMessageDto,
  MessageDto,
  UpdateMessageDto,
} from '../dto/message.dto';
import { MessageRepository } from './message.repository';
import { WsException } from '@nestjs/websockets';
import { Message } from '@prisma/client';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(private messageRepository: MessageRepository) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<MessageDto> {
    try {
      return await this.messageRepository.createMessage(createMessageDto);
    } catch (error) {
      const stackTrace = error instanceof Error ? error.stack : String(error);
      this.logger.error(
        `Failed to create message in room: ${createMessageDto.roomId}`,
        stackTrace,
      );
      throw error;
    }
  }

  async updateMessage(
    userId: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<MessageDto> {
    try {
      const existingMessage = await this.messageRepository.getMessage(
        updateMessageDto.messageId,
      );

      if (existingMessage.senderId !== userId) {
        throw new WsException('You can only update your own messages');
      }

      return await this.messageRepository.updateMessage(updateMessageDto);
    } catch (error) {
      const stackTrace = error instanceof Error ? error.stack : String(error);
      this.logger.error(
        `Failed to update message ${updateMessageDto.messageId} for user ${userId}`,
        stackTrace,
      );
      throw error;
    }
  }

  async findByRoomId(roomId: string): Promise<Message[]> {
    try {
      const messages = await this.messageRepository.findByRoomId(roomId);
      if (!messages.length) {
        this.logger.warn(`No messages found for room: ${roomId}`);
        return [];
      }

      return messages;
    } catch (error) {
      const stackTrace = error instanceof Error ? error.stack : String(error);
      this.logger.error(
        `Failed to retrieve messages for room: ${roomId}`,
        stackTrace,
      );
      throw new WsException('Failed to retrieve room messages');
    }
  }

  async getMessage(uuid: string): Promise<MessageDto> {
    try {
      return await this.messageRepository.getMessage(uuid);
    } catch (error) {
      const stackTrace = error instanceof Error ? error.stack : String(error);
      this.logger.error(`Failed to get message: ${uuid}`, stackTrace);
      throw error;
    }
  }

  async deleteMany(
    userId: string,
    deleteMessageDto: DeleteMessageDto,
  ): Promise<{ count: number }> {
    try {
      const result = await this.messageRepository.deleteMany(
        userId,
        deleteMessageDto,
      );

      this.logger.log(
        `User ${userId} deleted ${result.count} messages: ${deleteMessageDto.messageIds.join(', ')}`,
      );

      return result;
    } catch (error) {
      const stackTrace = error instanceof Error ? error.stack : String(error);
      this.logger.error(
        `Failed to delete messages for user ${userId}: ${deleteMessageDto.messageIds.join(', ')}`,
        stackTrace,
      );
      throw error;
    }
  }
}
