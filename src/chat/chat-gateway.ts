import { Logger, UnauthorizedException, UseFilters } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Server } from 'socket.io';
import { UserPayload } from 'src/types/user-payload.type';
import { ConnectedUserService } from './services/connected-user.service';
import { RoomService } from './services/room.service';
import { WsExceptionFilter } from './common/filters/ws-exception.filter';
import { RoomType, User } from '@prisma/client';
import { WsCurrentUser } from './common/decorators/ws-currentuser.decorator';
import { RoomTypeEnum } from './common/enums/room-type.enum';
import { MessageService } from './services/message.service';
import { WsValidationPipe } from './common/pipes/ws-validation.pipe';
import { CreateRoomDto, DeleteRoomDto, UpdateRoomDto } from './dto/room.dto';
import {
  CreateMessageDto,
  DeleteMessageDto,
  FilterMessageDto,
  UpdateMessageDto,
} from './dto/message.dto';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { verify } from 'crypto';

@UseFilters(WsExceptionFilter)
@WebSocketGateway(3002, { cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger('ChatGateway');

  constructor(
    private readonly jwtService: JwtService,
    private readonly roomService: RoomService,
    private readonly connectedUserService: ConnectedUserService,
    private readonly messageService: MessageService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('ChatGateway initialized');
    await this.connectedUserService.deleteAllUsers();
  }

  async handleConnection(socket: Socket): Promise<void> {
    try {
      const userPayload = await this.authenticateSocket(socket);
      await this.initializeUserConnection(userPayload, socket);
    } catch (error) {
      this.handleConnectionError(socket, error);
    }
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    try {
      await this.connectedUserService.deleteConnectedUser(socket.id);
      this.logger.log(`Client disconnected: ${socket.id}`);
    } catch (error) {
      this.logger.error(
        `Error during disconnect for socket ${socket.id}: ${error.message}`,
        error.stack,
      );
    }
  }

  @SubscribeMessage('createRoom')
  async onCreateRoom(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody(new WsValidationPipe()) createRoomDto: CreateRoomDto,
  ): Promise<void> {
    try {
      this.validateRoomTypeAndParticipants(
        createRoomDto.romType,
        createRoomDto.participantsId,
        currentUser.uuid,
      );

      const newRoom = await this.roomService.createRoom({
        ...createRoomDto,
        hostId: currentUser.uuid,
      });

      const createdRoomWithDetails = await this.roomService.findRoomById(
        newRoom.uuid,
      );

      await this.notifyRoomParticipants(
        createdRoomWithDetails.members,
        'roomCreated',
        createdRoomWithDetails,
      );
      this.logger.log(
        `Room with UUID ${newRoom.uuid} created and participants notified successfully.`,
      );
    } catch (error) {
      this.logger.error(`Failed to create room: ${error.message}`, error.stack);
      throw new WsException('Error occurred while creating the room.');
    }
  }

  @SubscribeMessage('getRoomDetails')
  async onFetchRoomDetails(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody(new WsValidationPipe())
    roomFetchRequestDto: { roomId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { uuid: userId } = currentUser;
    const { roomId } = roomFetchRequestDto;

    try {
      const room = await this.roomService.findRoomById(roomId);
      const isMember = room.members.some((member) => member.uuid === userId);
      if (!isMember) {
        throw new WsException(
          'Access Denied: You are not a member of this room.',
        );
      }

      client.emit('roomDetailsFetched', room);
      this.logger.log(
        `User ID ${userId} fetched details for Room UUID ${room.uuid} successfully.`,
      );
    } catch (error) {
      this.logger.error(
        `Error fetching details for Room UUID ${roomId} by User ID ${userId}: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while fetching room details.');
    }
  }

  @SubscribeMessage('updateRoom')
  async onUpdateRoom(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody(new WsValidationPipe()) updateRoomDto: UpdateRoomDto,
  ): Promise<void> {
    try {
      const room = await this.roomService.findRoomById(updateRoomDto.roomId);

      if (room.hostId !== currentUser.uuid) {
        throw new WsException('Only the host can update the room.');
      }

      if (room.roomType === RoomTypeEnum.PRIVATE) {
        throw new WsException('Private rooms cannot be updated.');
      }

      const updatedRoom = await this.roomService.updateRoom(
        updateRoomDto,
        currentUser.uuid,
      );

      await this.notifyRoomParticipants(
        updatedRoom.members,
        'roomUpdated',
        updatedRoom,
      );
      this.logger.log(
        `Room with UUID ${updateRoomDto.roomId} updated and participants notified successfully.`,
      );
    } catch (error) {
      this.logger.error(
        `Error updating room with UUID ${updateRoomDto.roomId}: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while updating room details.');
    }
  }

  @SubscribeMessage('joinRoom')
  async onJoinRoom(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody(new WsValidationPipe()) roomJoinDto: { roomId: string },
  ): Promise<void> {
    const { uuid: userId } = currentUser;
    const { roomId } = roomJoinDto;

    try {
      const room = await this.roomService.joinRoom(roomId, userId);

      this.verifyUserAuthorization(room.members, userId);

      await this.notifyRoomParticipants(room.members, 'userJoined', {
        userId,
        roomId,
      });
      this.logger.log(
        `User ID ${userId} joined Room UUID ${room.uuid} successfully.`,
      );
    } catch (error) {
      this.logger.error(
        `Error joining room with UUID ${roomId} by User ID ${userId}: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while joining the room.');
    }
  }

  @SubscribeMessage('assignUsers')
  async onAssignUsers(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody(new WsValidationPipe())
    assignUsersDto: { roomId: string; participantsId: string[] },
  ): Promise<void> {
    const { uuid: userId } = currentUser;
    const { roomId, participantsId } = assignUsersDto;

    try {
      const room = await this.roomService.findRoomById(roomId);
      if (room.hostId !== userId) {
        throw new WsException('Only the host can assign users to the room.');
      }

      this.validateRoomTypeAndParticipants(
        room.roomType,
        participantsId,
        userId,
      );
      this.verifyUserAuthorization(room.members, userId);

      const updatedRoom = await this.roomService.assignUsers(
        assignUsersDto,
        userId,
      );

      await this.notifyRoomParticipants(
        updatedRoom.members,
        'usersAssigned',
        updatedRoom,
      );
      this.logger.log(
        `Users assigned to Room UUID ${roomId} successfully by User ID ${userId}.`,
      );
    } catch (error) {
      this.logger.error(
        `Error assigning users to Room UUID ${roomId} by User ID ${userId}: ${error.message}`,
        error.stack,
      );
      throw new WsException(
        'Error occurred while assigning users to the room.',
      );
    }
  }

  @SubscribeMessage('leaveRoom')
  async onLeaveRoom(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody(new WsValidationPipe()) roomLeaveDto: { roomId: string },
  ): Promise<void> {
    const { uuid: userId } = currentUser;
    const { roomId } = roomLeaveDto;

    try {
      const room = await this.roomService.leaveRoom(roomId, userId);
      this.verifyUserAuthorization(room.members, userId);

      await this.notifyRoomParticipants(room.members, 'userLeft', {
        userId,
        roomId,
      });
      this.logger.log(
        `User ID ${userId} left Room UUID ${room.uuid} successfully.`,
      );
    } catch (error) {
      this.logger.error(
        `Error leaving room with UUID ${roomId} by User ID ${userId}: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while leaving the room.');
    }
  }

  @SubscribeMessage('deleteUsers')
  async onDeleteUsers(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody(new WsValidationPipe())
    deleteUsersDto: { roomId: string; participantsId: string[] },
  ): Promise<void> {
    const { uuid: userId } = currentUser;
    const { roomId, participantsId } = deleteUsersDto;

    try {
      const room = await this.roomService.findRoomById(roomId);
      if (room.hostId !== userId) {
        throw new WsException('Only the host can delete users from the room.');
      }

      this.verifyUserAuthorization(room.members, userId);
      this.validateRoomTypeAndParticipants(
        room.roomType,
        participantsId,
        userId,
      );

      const updatedRoom = await this.roomService.deleteUsers(
        deleteUsersDto,
        userId,
      );

      await this.notifyRoomParticipants(
        updatedRoom.members,
        'usersDeleted',
        updatedRoom,
      );
      this.logger.log(
        `Users deleted from Room UUID ${roomId} successfully by User ID ${userId}.`,
      );
    } catch (error) {
      this.logger.error(
        `Error deleting users from Room UUID ${roomId} by User ID ${userId}: ${error.message}`,
        error.stack,
      );
      throw new WsException(
        'Error occurred while deleting users from the room.',
      );
    }
  }

  @SubscribeMessage('deleteRoom')
  async onDeleteRoom(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody(new WsValidationPipe()) deleteRoomDto: DeleteRoomDto,
  ): Promise<void> {
    const { uuid: userId } = currentUser;
    const { roomId } = deleteRoomDto;

    try {
      const roomToDelete = await this.roomService.deleteRoom(
        roomId,
        currentUser.uuid,
      );

      await this.notifyRoomParticipants(
        roomToDelete.members.filter((member) => member.uuid !== userId),
        'roomDeleted',
        { message: `Room with UUID ${roomId} has been successfully deleted.` },
      );

      this.logger.log(
        `Room with UUID ${roomId} deleted successfully by user ID ${userId}.`,
      );
    } catch (error) {
      this.logger.error(
        `Error deleting room with UUID ${roomId} by User ID ${userId}: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while deleting the room.');
    }
  }

  @SubscribeMessage('sendMessage')
  async onSendMessage(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody(new WsValidationPipe()) createMessageDto: CreateMessageDto,
  ): Promise<void> {
    const userId = currentUser.uuid;
    const { roomId } = createMessageDto;

    try {
      const room = await this.roomService.findRoomById(roomId);
      const isMember = room.members.some((member) => member.uuid === userId);
      if (!isMember) {
        throw new WsException(
          'Access Denied: You are not a member of this room.',
        );
      }

      const newMessage = await this.messageService.createMessage({
        ...createMessageDto,
        senderId: userId,
      });

      await this.notifyRoomParticipants(
        room.members,
        'messageSent',
        newMessage,
      );
      this.logger.log(
        `User ID ${userId} sent a new message in Room UUID ${roomId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send message in Room UUID ${roomId} by User ID ${userId}: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while sending the message.');
    }
  }

  @SubscribeMessage('findAllMessages')
  async onFindAllMessages(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody(new WsValidationPipe()) filterMessageDto: FilterMessageDto,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    const { uuid: userId } = currentUser;
    const { roomId } = filterMessageDto;

    try {
      const room = await this.roomService.findRoomById(roomId);
      const isMember = room.members.some((member) => member.uuid === userId);
      if (!isMember) {
        throw new WsException(
          'Access Denied: You are not a member of this room.',
        );
      }

      const messages = await this.messageService.findByRoomId(
        filterMessageDto.roomId,
      );
      this.server.to(socket.id).emit('allMessages', messages);
    } catch (error) {
      this.logger.error(
        `Failed to fetch messages for Room UUID ${roomId} by User ID ${userId}: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while fetching messages.');
    }
  }

  @SubscribeMessage('updateMessage')
  async onUpdateMessage(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody(new WsValidationPipe()) updateMessageDto: UpdateMessageDto,
  ): Promise<void> {
    const userId = currentUser.uuid;

    try {
      const updatedMessage = await this.messageService.updateMessage(
        userId,
        updateMessageDto,
      );

      const room = await this.roomService.findRoomById(updatedMessage.roomId);
      const updatedConversation = await this.messageService.findByRoomId(
        updatedMessage.roomId,
      );

      await this.notifyRoomParticipants(
        room.members,
        'messageUpdated',
        updatedConversation,
      );

      this.logger.log(
        `Message UUID ${updateMessageDto.messageId} updated successfully by User ID ${userId}.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update message UUID ${updateMessageDto.messageId} by User ID ${userId}: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while updating the message.');
    }
  }

  @SubscribeMessage('deleteMessage')
  async onDeleteMessage(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody(new WsValidationPipe()) deleteMessageDto: DeleteMessageDto,
  ): Promise<void> {
    const userId = currentUser.uuid;
    const { roomId, messageIds } = deleteMessageDto;

    try {
      const room = await this.roomService.findRoomById(roomId);
      const isMember = room.members.some((member) => member.uuid === userId);
      if (!isMember) {
        throw new WsException(
          'Access Denied: You are not a member of this room.',
        );
      }

      await this.messageService.deleteMany(userId, deleteMessageDto);

      await this.notifyRoomParticipants(room.members, 'messageDeleted', {
        messageIds,
      });

      this.logger.log(
        `Messages deleted successfully in Room UUID ${roomId} by User ID ${userId}.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete messages in Room UUID ${roomId} by User ID ${userId}: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while deleting messages.');
    }
  }

  private async authenticateSocket(socket: Socket): Promise<UserPayload> {
    try {
      console.log(socket.handshake.headers);
      const token: string = socket.handshake.headers.token as string;
      const userPayload = this.jwtService.verify<UserPayload>(token, {
        secret: process.env.JWT_SECRET,
      });
      return userPayload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Token expired. Please refresh your token.',
        );
      }
      this.logger.warn(
        `JWT verification failed for socket ${socket.id}: ${error.message}`,
      );
      throw new UnauthorizedException('Authentication failed: Invalid token.');
    }
  }

  private async initializeUserConnection(
    userPayload: UserPayload,
    socket: Socket,
  ): Promise<void> {
    socket.data.user = userPayload;
    await this.connectedUserService.createConnectedUser(userPayload, socket.id);

    const rooms = await this.roomService.findByUserId(userPayload.uuid);
    this.server.to(socket.id).emit('userAllRooms', rooms);
    this.logger.log(
      `Client connected: ${socket.id} - User ID: ${userPayload.uuid}`,
    );
  }

  private handleConnectionError(socket: Socket, error: Error): void {
    this.logger.error(
      `Connection error for socket ${socket.id}: ${error.message}`,
    );
    socket.emit('exception', error.message || 'Authentication error');
    socket.disconnect();
  }

  private verifyUserAuthorization(members: User[], userId: string): void {
    const isMember = members.some((member) => member.uuid === userId);
    if (!isMember) {
      throw new WsException(
        `Operation failed: You are not authorized to perform this action.`,
      );
    }
  }

  private validateRoomTypeAndParticipants(
    roomType: string,
    participants: string[],
    userId: string,
  ): void {
    if (participants.includes(userId)) {
      throw new WsException(
        'The room host should not be included in the participants list.',
      );
    }

    if (roomType === RoomTypeEnum.PRIVATE && participants.length !== 1) {
      throw new WsException(
        'Private chat must include exactly one participant aside from the host.',
      );
    }

    if (roomType === RoomTypeEnum.GROUP && participants.length < 1) {
      throw new WsException(
        'Group chat must include at least one participant aside from the host.',
      );
    }

    const uniqueParticipantIds = new Set(participants);
    if (uniqueParticipantIds.size !== participants.length) {
      throw new WsException('The participants list contains duplicates.');
    }
  }

  private async notifyRoomParticipants(
    members: User[],
    event: string,
    payload: any,
  ): Promise<void> {
    const connectedUsers =
      await this.connectedUserService.findConnectedUsersByUserIds(
        members.map((member) => member.uuid),
      );

    const notificationPromises = connectedUsers.map((user) => ({
      socketId: user.socketId,
      promise: this.emitToSocket(user.socketId, event, payload),
    }));

    const results = await Promise.allSettled(
      notificationPromises.map((np) => np.promise),
    );

    results.forEach((result, index) => {
      const { socketId } = notificationPromises[index];
      if (result.status === 'fulfilled') {
        this.logger.log(
          `Notification sent successfully to Socket ID ${socketId} for event '${event}'`,
        );
      } else {
        this.logger.error(
          `Failed to notify Socket ID ${socketId} for event '${event}': ${result.reason}`,
        );
      }
    });
  }

  private async emitToSocket(
    socketId: string,
    event: string,
    payload: any,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.to(socketId).emit(event, payload, (response: any) => {
        if (response && response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  @SubscribeMessage('refreshToken')
  async onRefreshToken(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody() refreshTokenDto: { refreshToken: string },
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    try {
      const refreshPayload = this.jwtService.verify<UserPayload>(
        refreshTokenDto.refreshToken,
        {
          secret: process.env.JWT_REFRESH_SECRET,
        },
      );

      if (refreshPayload.uuid !== currentUser.uuid) {
        throw new WsException('Invalid refresh token.');
      }

      const newAccessToken = this.jwtService.sign(
        { uuid: currentUser.uuid, email: currentUser.email },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '1h' },
      );

      socket.emit('tokenRefreshed', { accessToken: newAccessToken });
      this.logger.log(
        `Token refreshed successfully for User ID ${currentUser.uuid}`,
      );
    } catch (error) {
      this.logger.error(
        `Token refresh failed for User ID ${currentUser.uuid}: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while refreshing token.');
    }
  }
}
