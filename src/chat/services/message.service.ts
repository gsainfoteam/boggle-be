import { Injectable, Logger } from "@nestjs/common";
import { CreateMessageDto, DeleteMessageDto, MessageDto, UpdateMessageDto } from "../dto/message.dto";
import { MessageRepository } from "./message.repository";
import { WsException } from "@nestjs/websockets";
@Injectable()
export class MessageService {
  private readonly logger = new Logger("MessageService");

  constructor(private messageRepository: MessageRepository) { }

  async createMessage(createMessageDto: CreateMessageDto): Promise<MessageDto> {
    try {
      return await this.messageRepository.createMessage(createMessageDto);
    } catch (error) {
      this.logger.error(`Failed to create message: ${JSON.stringify(createMessageDto)}`, error.stack);
      if (error instanceof WsException) {
        throw error;
      }
      throw new WsException("Unexpected error while creating message.");
    }
  }

  async updateMessage(userId: string, updateMessageDto: UpdateMessageDto): Promise<MessageDto> {
    try {
      const message = await this.messageRepository.updateMessage(updateMessageDto);

      if (message.senderId !== userId) {
        throw new WsException("You can only update your own messages.");
      }
      return message;
    } catch (error) {
      this.logger.error(`Failed to update message with ID: ${updateMessageDto.messageId} for user: ${userId}`, error.stack);
      if (error instanceof WsException) {
        throw error;
      }
      throw new WsException("Unexpected error when updating message.");
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