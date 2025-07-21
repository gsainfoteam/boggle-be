import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateMessageDto,
  DeleteMessageDto,
  UpdateMessageDto,
} from '../dto/message.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { WsException } from '@nestjs/websockets';
import { Message } from '@prisma/client';

@Injectable()
export class MessageRepository {
  constructor(private prisma: PrismaService) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    try {
      return await this.prisma.message.create({
        data: {
          ...createMessageDto,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new WsException(`Database error: ${error.message}`);
      }
      throw new WsException('Failed to create message');
    }
  }

  async findByRoomId(roomId: string): Promise<Message[]> {
    return await this.prisma.message.findMany({
      where: { roomId },
      include: { sender: true },
    });
  }

  async getMessage(uuid: string): Promise<Message> {
    try {
      return await this.prisma.message.findUniqueOrThrow({
        where: { id: uuid },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Message not found');
      }
      throw new WsException('Failed to retrieve message');
    }
  }

  async updateMessage({ messageId, content }: UpdateMessageDto): Promise<Message> {
    try {
      return await this.prisma.message.update({
        where: { id: messageId },
        data: {
          content: content,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Message not found');
      }
      throw new WsException('Failed to update message');
    }
  }

  async deleteMany(userId: string, deleteMessageDto: DeleteMessageDto): Promise<{ count: number }> {
    const messages = await this.prisma.message.findMany({
      where: {
        id: { in: deleteMessageDto.messageIds },
      },
    });

    const notOwnedMessages = messages.filter((msg) => msg.senderId !== userId);
    if (notOwnedMessages.length > 0) {
      throw new WsException('You can only delete your own messages');
    }

    const notFoundIds = deleteMessageDto.messageIds.filter(
      (id) => !messages.find((msg) => msg.id === id),
    );
    if (notFoundIds.length > 0) {
      throw new WsException(`Messages not found: ${notFoundIds.join(', ')}`);
    }

    try {
      return await this.prisma.message.deleteMany({
        where: {
          id: { in: deleteMessageDto.messageIds },
          senderId: userId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new WsException(`Database error: ${error.message}`);
      }
      throw new WsException('Failed to delete messages');
    }
  }
}