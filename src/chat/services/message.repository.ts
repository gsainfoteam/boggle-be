import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateMessageDto, DeleteMessageDto, MessageDto, UpdateMessageDto } from "../dto/message.dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class MessageRepository{
  constructor(private prisma: PrismaService) {}

    async createMessage(
      createMessageDto: CreateMessageDto,
    ) {
      return await this.prisma.message.create({
        data: {
          ...createMessageDto,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
    }).catch((error) => {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException("Database Error");
      }
      throw new InternalServerErrorException("Internal Server Error");})
    }

    async getMessage(uuid: string){
      return await this.prisma.message.findUniqueOrThrow({
        where: { uuid: uuid },
      }).catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          throw new InternalServerErrorException("Database Error");
        }
        throw new InternalServerErrorException("Internal Server Error");})
    }
    
    async updateMessage({messageId, content}: UpdateMessageDto){
      const message = await this.prisma.message.findUniqueOrThrow({
        where: {uuid: messageId},
      })
      if(!message){
        throw new InternalServerErrorException("Message uuid is not found");
      }
      try {
        return await this.prisma.message.update({
          where: { uuid: messageId},
          data: { 
            content: content,
            updatedAt: new Date(new Date().getTime())}
      })
    } catch (error){
          if (error instanceof PrismaClientKnownRequestError) {
            throw new InternalServerErrorException("Database Error");
          } 
            throw new InternalServerErrorException("Internal Server Error");
          }
        }


  async deleteMany(userId:string, DeleteMessageDto: DeleteMessageDto ) {
    for(const id of DeleteMessageDto.messageIds){
      const message = await this.prisma.message.findUnique({
        where: { uuid: id},
      })

      if(!message){
        throw new InternalServerErrorException("Message uuid is not found");
      }
      if(message.senderId !== userId){
        throw new InternalServerErrorException("Only owner can delete the message");
      }
      try {
        await this.prisma.message.delete({
          where: { uuid: id},
          include: {
            sender: {
              select: {
                uuid: true,
              },
            },
            room: {
              select: {
                uuid: true,
              },
            },
          }
        })
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          throw new InternalServerErrorException("Database Error");
        }
        throw new InternalServerErrorException("Internal Server Error");
      }
    }
  }
}