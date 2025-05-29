import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateMessageDto, DeleteMessageDto, MessageDto, UpdateMessageDto } from "../dto/message.dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { WsException } from "@nestjs/websockets";
import { Message } from "@prisma/client";

@Injectable()
export class MessageRepository {
  private readonly logger = new Logger('MessageRepository');

  constructor(private prisma: PrismaService) { }

  async createMessage(
    createMessageDto: CreateMessageDto,
  ) {
    try {
      return await this.prisma.message.create({
        data: {
          ...createMessageDto,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create message: ${JSON.stringify(createMessageDto)}`, error.stack);
      if (error instanceof PrismaClientKnownRequestError) {
        throw new WsException("Database error when creating message.");
      }
      throw new WsException("Unexpected error when creating message.");
    }
  }


  async findByRoomId(roomId: string): Promise<Message[]> {
        return await this.prisma.message.findMany({
            where: { roomId },
            include: { sender: true }, 
        });
    }

  async getMessage(uuid: string) {
    try {
      return await this.prisma.message.findUniqueOrThrow({
        where: { uuid: uuid },
      });
    } catch (error) {
      this.logger.error(`Failed to get message with UUID: ${uuid}`, error.stack);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new WsException('Message not found.');
        }
        throw new WsException("Database error when retrieving message.");
      }
      throw new WsException("Unexpected error when retrieving message.");
    }
  }

  async updateMessage({ messageId, content }: UpdateMessageDto) {
    try {
      return await this.prisma.message.update({
        where: { uuid: messageId },
        data: {
          content: content,
          updatedAt: new Date(),
        }
      });
    } catch (error) {
      this.logger.error(`Failed to update message with ID: ${messageId}`, error.stack);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new WsException('Message not found.');
        }
        throw new WsException("Database error when updating message.");
      }
      throw new WsException("Unexpected error when updating message.");
    }
  }

  async deleteMany(userId: string, deleteMessageDto: DeleteMessageDto) {
    for (const id of deleteMessageDto.messageIds) {
      try {
        const message = await this.prisma.message.findUnique({
          where: { uuid: id },
        });

        if (!message) {
          throw new WsException(`Message with ID ${id} not found.`);
        }
        if (message.senderId !== userId) {
          throw new WsException("You can only delete your own messages.");
        }

        await this.prisma.message.delete({
          where: { uuid: id },
        });
      } catch (error) {
        this.logger.error(`Failed to delete message with ID: ${id} for user: ${userId}`, error.stack);
        if (error instanceof WsException) {
          throw error;
        }
        if (error instanceof PrismaClientKnownRequestError) {
          throw new WsException("Database error when deleting message.");
        }
        throw new WsException("Unexpected error when deleting messages.");
      }
    }
  }
}