import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateMessageDto,
  DeleteMessageDto,
  MessageDto,
  UpdateMessageDto,
} from '../dto/message.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { WsException } from '@nestjs/websockets';
import { Message } from '@prisma/client';
import { create } from 'domain';

@Injectable()
export class MessageRepository {
  private readonly logger = new Logger('MessageRepository');

  constructor(private prisma: PrismaService) {}

  async createMessage(createMessageDto: CreateMessageDto) {
    try {
      return await this.prisma.message.create({
        data: {
          ...createMessageDto,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to create message: ${JSON.stringify(createMessageDto)}`,
        error.stack,
      );
      if (error instanceof PrismaClientKnownRequestError) {
        throw new WsException('Database error when creating message.');
      }
      throw new WsException('Unexpected error when creating message.');
    }
  }

  async findByRoomId(roomId: string): Promise<Message[]> {
    try {
      return await this.prisma.message.findMany({
        where: { roomId },
        include: { sender: true },
      });
    } catch (error) {
      this.logger.error(
        `Failed to find messages for the room with ID: ${roomId}`,
        error.stack,
      );
      if (error instanceof PrismaClientKnownRequestError) {
        throw new WsException('Database error when retrieving messages.');
      }
      throw new WsException('Unexpected error when retrieving messages.');
    }
  }

  async getMessage(uuid: string) {
    try {
      return await this.prisma.message.findUniqueOrThrow({
        where: { uuid: uuid },
      });
    } catch (error) {
      this.logger.error(
        `Failed to get message with UUID: ${uuid}`,
        error.stack,
      );
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new WsException('Message not found.');
        }
        throw new WsException('Database error when retrieving message.');
      }
      throw new WsException('Unexpected error when retrieving message.');
    }
  }

  async updateMessage({ messageId, content }: UpdateMessageDto) {
    try {
      return await this.prisma.message.update({
        where: { uuid: messageId },
        data: {
          content: content,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to update message with ID: ${messageId}`,
        error.stack,
      );
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new WsException('Message not found.');
        }
        throw new WsException('Database error when updating message.');
      }
      throw new WsException('Unexpected error when updating message.');
    }
  }

  async deleteMany(userId: string, deleteMessageDto: DeleteMessageDto) {
    try {
      const messages = await this.prisma.message.findMany({
        where: {
          uuid: { in: deleteMessageDto.messageIds },
        },
      });

      const notOwnedMessages = messages.filter((msg) => msg.senderId != userId);
      if (notOwnedMessages.length > 0) {
        throw new WsException('You can delete only your own messages.');
      }

      const notFoundIds = deleteMessageDto.messageIds.filter(
        (id) => !messages.find((msg) => msg.uuid === id),
      );
      if (notFoundIds.length > 0) {
        throw new WsException(
          `Messages not found IDs: ${notFoundIds.join(', ')}`,
        );
      }

      const result = await this.prisma.message.deleteMany({
        where: {
          uuid: { in: deleteMessageDto.messageIds },
          senderId: userId,
        },
      });
      this.logger.log(
        `Deleted messages with IDs: ${deleteMessageDto.messageIds.join(', ')}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to delete messages for user id: ${userId}`,
        error.stack,
      );
      if (error instanceof WsException) {
        throw error;
      }
      if (error instanceof PrismaClientKnownRequestError) {
        throw new WsException('Database error when deleting messages.');
      }
      throw new WsException('Unexpected error when deleting messages.');
    }
  }
}
