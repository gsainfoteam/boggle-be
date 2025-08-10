import { Module } from '@nestjs/common';
import { ChatGateway } from './chat-gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoomService } from './services/room.service';
import { ConnectedUserService } from './services/connected-user.service';
import { MessageService } from './services/message.service';
import { RoomRepository } from './services/room.repository';
import { ConnectedUserRepository } from './services/connected-user.repository';
import { MessageRepository } from './services/message.repository';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  providers: [
    ChatGateway,
    PrismaService,
    RoomService,
    ConnectedUserService,
    MessageService,
    RoomRepository,
    ConnectedUserRepository,
    MessageRepository,
  ],
})
export class ChatModule {}
