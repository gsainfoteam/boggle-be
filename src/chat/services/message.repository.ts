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
  constructor(private prisma: PrismaService) { }

  private readonly baseWhereDeleted = {
    isDeleted: false,
    deletedAt: null,
  };

  async createMessage({ roomId, content, senderId }: CreateMessageDto): Promise<Message> {
    try {
      await this.prisma.room.findFirstOrThrow({
        where: {
          id: roomId,
          ...this.baseWhereDeleted,
        }
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new WsException('Room not found or has been deleted');
      }
      throw error;
    }

    try {
      return await this.prisma.message.create({
        data: {
          roomId: roomId,
          content: content,
          senderId: senderId,
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
    try {
      await this.prisma.room.findFirstOrThrow({
        where: {
          id: roomId,
          ...this.baseWhereDeleted,
        }
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new WsException('Room not found or has been deleted');
      }
      throw error;
    }

    return await this.prisma.message.findMany({
      where: {
        roomId,
        ...this.baseWhereDeleted
      },
      include: {
        sender: true,
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }

  async getMessage(uuid: string): Promise<Message> {
    try {
      return await this.prisma.message.findUniqueOrThrow({
        where: {
          id: uuid,
          ...this.baseWhereDeleted
        },
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
        where: {
          id: messageId,
          ...this.baseWhereDeleted
        },
        data: {
          content: content,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Message not found or has been deleted');
      }
      throw new WsException('Failed to update message');
    }
  }

  async deleteMany(userId: string, { roomId, messageIds }: DeleteMessageDto): Promise<{ count: number }> {
    const isRoomExisting = await this.prisma.room.findFirstOrThrow({
      where: {
        id: roomId,
        ...this.baseWhereDeleted,
      }
    });

    const messages = await this.prisma.message.findMany({
      where: {
        id: { in: messageIds },
        ...this.baseWhereDeleted,
      },
    });

    const notOwnedMessages = messages.filter((msg) => msg.senderId !== userId);
    if (notOwnedMessages.length > 0) {
      throw new WsException('You can only delete your own messages');
    }

    const notFoundIds = messageIds.filter(
      (id) => !messages.find((msg) => msg.id === id),
    );
    if (notFoundIds.length > 0) {
      throw new WsException(`Messages not found or already deleted: ${notFoundIds.join(', ')}`);
    }

    try {
      return await this.prisma.message.deleteMany({
        where: {
          id: { in: messageIds },
          senderId: userId,
          ...this.baseWhereDeleted,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new WsException(`Database error: ${error.message}`);
      }
      throw new WsException('Failed to delete messages');
    }
  }

  async restoreMessagesByRoomId(roomId: string): Promise<{ count: number }> {
    try {
      return await this.prisma.message.updateMany({
        where: {
          roomId: roomId,
          isDeleted: true,
        },
        data: {
          isDeleted: false,
          deletedAt: null,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new WsException(`Database error when restoring messages: ${error.message}`);
      }
      throw new WsException('Failed to restore messages');
    }
  }
}