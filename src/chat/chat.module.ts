import { Module } from '@nestjs/common';
import { ChatGateway } from './chat-gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { RoomService } from './services/room.service';
import { ConnectedUserService } from './services/connected-user.service';
import { MessageService } from './services/message.service';
import { RoomRepository } from './services/room.repository';
import { ConnectedUserRepository } from './services/connected-user.repository';
import { MessageRepository } from './services/message.repository';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [AuthModule, JwtModule],
  providers: [
    ChatGateway,
    PrismaService,
    RoomService,
    ConnectedUserService,
    MessageService,
    RoomRepository,
    ConnectedUserRepository,
    MessageRepository,
    JwtService,
  ],
})
export class ChatModule {}
