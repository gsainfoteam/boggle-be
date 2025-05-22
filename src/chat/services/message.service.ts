import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateMessageDto, DeleteMessageDto, MessageDto, UpdateMessageDto } from "../dto/message.dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { MessageRepository } from "./message.repository";

@Injectable()
export class MessageService {
  constructor(private messageRepository: MessageRepository) {}

    async createMessage(createMessageDto: CreateMessageDto): Promise<MessageDto> {
      try {
        return await this.messageRepository.createMessage(createMessageDto);
      } catch (error) {
        throw new InternalServerErrorException("Internal Server Error");
      }
    }

    async updateMessage(userId:string, updateMessageDto: UpdateMessageDto): Promise<MessageDto> {
      const message = await this.messageRepository.updateMessage(updateMessageDto);
      if(message.senderId !== userId){
        throw new InternalServerErrorException("Only owner can update the message");
      }
      return message;
    }

    async getMessage(uuid: string): Promise<MessageDto> {
      try {
        return await this.messageRepository.getMessage(uuid);
      } catch (error) {
        throw new InternalServerErrorException("Internal Server Error");
      }
    }

   async deleteMany(userId: string, deleteMessageDto: DeleteMessageDto): Promise<void> {
    try {
      await this.messageRepository.deleteMany(userId, deleteMessageDto);
    } catch (error) {
      throw new InternalServerErrorException("Internal Server Error");
    }
  }

}