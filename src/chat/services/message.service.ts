import { Injectable, Logger } from "@nestjs/common";
import { CreateMessageDto, DeleteMessageDto, MessageDto, UpdateMessageDto } from "../dto/message.dto";
import { MessageRepository } from "./message.repository";
import { WsException } from "@nestjs/websockets";
import { Message } from "@prisma/client";
@Injectable()
export class MessageService {
  private readonly logger = new Logger("MessageService");

  constructor(private messageRepository: MessageRepository) { }

  async createMessage(createMessageDto: CreateMessageDto): Promise<MessageDto> {
    try {
      return await this.messageRepository.createMessage(createMessageDto);
    } catch (error) {
      this.logger.error(`Failed to create message: ${createMessageDto.roomId}`, error.stack);
      if (error instanceof WsException) {
        throw error;
      }
      throw new WsException("Unexpected error while creating message.");
    }
  }

  async updateMessage(userId: string, updateMessageDto: UpdateMessageDto): Promise<MessageDto> {
    try {
      const existingMessage = await this.messageRepository.getMessage(updateMessageDto.messageId)
      if (existingMessage.senderId !== userId) {
        throw new WsException("You can only update your own messages.");
      }
      const message = await this.messageRepository.updateMessage(updateMessageDto);
      return message;
    } catch (error) {
      this.logger.error(`Failed to update message with ID: ${updateMessageDto.messageId} for user: ${userId}`, error.stack);
      if (error instanceof WsException) {
        throw error;
      }
      throw new WsException("Unexpected error when updating message.");
    }
  }

  async findByRoomId(roomId: string): Promise<Message[]> {
    try {
      const messages = await this.messageRepository.findByRoomId(roomId);
      if (!messages.length) {
        throw new WsException('No messages found for this room.');
      }
      return messages;
    } catch (error) {
      this.logger.error(`Failed to retrieve messages for room ID ${roomId}: ${error.message}`, error.stack);
      if (error instanceof WsException) {
        throw error;
      }
      throw new WsException('An error occurred while fetching messages.');
    }
  }

  async getMessage(uuid: string): Promise<MessageDto> {
    try {
      return await this.messageRepository.getMessage(uuid);
    } catch (error) {
      this.logger.error(`Failed to get message with UUID: ${uuid}`, error.stack);
      if (error instanceof WsException) {
        throw error;
      }
      throw new WsException("Unexpected error when retrieving message.");
    }
  }

  async deleteMany(userId: string, deleteMessageDto: DeleteMessageDto): Promise<void> {
    try {
      await this.messageRepository.deleteMany(userId, deleteMessageDto);
    } catch (error) {
      this.logger.error(`Failed to delete messages for user: ${userId}, message IDs: ${deleteMessageDto.messageIds.join(', ')}`, error.stack);
      if (error instanceof WsException) {
        throw error;
      }
      throw new WsException("Unexpected error when deleting messages.");
    }
  }
}