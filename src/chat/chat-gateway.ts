import { Logger, UnauthorizedException, UseFilters } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Server } from 'socket.io';
import { UserPayload } from 'src/types/user-payload.type';
import { ConnectedUserService } from './services/connected-user.service';
import { RoomService } from './services/room.service';
import { WsExceptionFilter } from './common/filters/ws-exception.filter';
import { User } from '@prisma/client';
import { WsCurrentUser } from './common/decorators/ws-currentuser.decorator';
import { RoomTypeEnum } from './common/enums/room-type.enum';
import { MessageService } from './services/message.service';
import { WsValidationPipe } from './common/pipes/ws-validation.pipe';
import {
  AssignUsersDto,
  CreateRoomDto,
  DeleteRoomDto,
  LeaveRoomDto,
  RoomFetchRequestDto,
  RoomJoinDto,
  UpdateRoomDto,
} from './dto/room.dto';
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
import { ConfigService } from '@nestjs/config';

@UseFilters(WsExceptionFilter)
@WebSocketGateway(3002, { cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger('ChatGateway');

  private readonly jwtSecret;
  private readonly jwtRefreshSecret;
  private readonly jwtExpire;

  constructor(
    private readonly jwtService: JwtService,
    private readonly roomService: RoomService,
    private readonly connectedUserService: ConnectedUserService,
    private readonly messageService: MessageService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET');
    this.jwtRefreshSecret = this.configService.get<string>('JWT_SECRET');
    this.jwtExpire = this.configService.get<string>('JWT_EXPIRE');

    if (!this.jwtSecret || !this.jwtRefreshSecret) {
      throw new Error('JWT secrets are not configured properly');
    }
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('ChatGateway initialized');
    await this.connectedUserService.deleteAllUsers();
  }

  async handleConnection(socket: Socket): Promise<void> {
    try {
      const userPayload = await this.authenticateSocket(socket);
      console.log(userPayload);
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
        'create',
        createRoomDto.roomType,
        createRoomDto.participantsId,
        currentUser.id,
      );

      const newRoom = await this.roomService.createRoom({
        ...createRoomDto,
        hostId: currentUser.id,
      });

      const createdRoomWithDetails = await this.roomService.findRoomById(
        newRoom.id,
      );

      await this.notifyRoomParticipants(
        createdRoomWithDetails.members,
        'roomCreated',
        createdRoomWithDetails,
      );
      this.logger.log(
        `Room with ID ${newRoom.id} created and participants notified successfully.`,
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
    roomFetchRequestDto: RoomFetchRequestDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { id: userId } = currentUser;
    const { roomId } = roomFetchRequestDto;

    try {
      const room = await this.roomService.findRoomById(roomId);
      this.verifyUserAuthorization(room.members, userId);

      client.emit('roomDetailsFetched', room);
      this.logger.log(
        `User ID ${userId} fetched details for Room UUID ${room.id} successfully.`,
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

      if (room.hostId !== currentUser.id) {
        throw new WsException('Only the host can update the room.');
      }

      if (room.roomType === RoomTypeEnum.PRIVATE) {
        throw new WsException('Private rooms cannot be updated.');
      }

      this.verifyUserAuthorization(room.members, currentUser.id);

      const updatedRoom = await this.roomService.updateRoom(
        updateRoomDto,
        currentUser.id,
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
    @MessageBody(new WsValidationPipe()) roomJoinDto: RoomJoinDto,
  ): Promise<void> {
    const { id: userId } = currentUser;
    const { roomId } = roomJoinDto;

    try {
      const room = await this.roomService.joinRoom(roomId, userId);

      this.verifyUserAuthorization(room.members, userId);

      await this.notifyRoomParticipants(room.members, 'userJoined', {
        userId,
        roomId,
      });
      this.logger.log(
        `User ID ${userId} joined Room UUID ${room.id} successfully.`,
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
    assignUsersDto: AssignUsersDto,
  ): Promise<void> {
    const { id: userId } = currentUser;
    const { roomId, participantsId } = assignUsersDto;

    try {
      const room = await this.roomService.findRoomById(roomId);
      if (room.hostId !== userId) {
        throw new WsException('Only host can assign users to the room.');
      }

      this.validateRoomTypeAndParticipants(
        'assign',
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
    @MessageBody(new WsValidationPipe()) leaveRoomDto: LeaveRoomDto,
  ): Promise<void> {
    const { id: userId } = currentUser;
    const { roomId } = leaveRoomDto;

    try {
      const room = await this.roomService.leaveRoom(roomId, userId);

      await this.notifyRoomParticipants(room.members, 'userLeft', {
        userId,
        roomId,
      });
      this.logger.log(
        `User ID ${userId} left Room UUID ${room.id} successfully.`,
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
    const { id: userId } = currentUser;
    const { roomId, participantsId } = deleteUsersDto;

    try {
      const room = await this.roomService.findRoomById(roomId);
      if (room.hostId !== userId) {
        throw new WsException('Only the host can delete users from the room.');
      }

      this.verifyUserAuthorization(room.members, userId);
      this.validateRoomTypeAndParticipants(
        'delete',
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
    const { id: userId } = currentUser;
    const { roomId } = deleteRoomDto;

    try {
      const roomToDelete = await this.roomService.deleteRoom(
        roomId,
        currentUser.id,
      );

      await this.notifyRoomParticipants(
        roomToDelete.members.filter((member) => member.id !== userId),
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
    const userId = currentUser.id;
    const { roomId } = createMessageDto;

    try {
      const room = await this.roomService.findRoomById(roomId);
      this.verifyUserAuthorization(room.members, userId);

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
    const { id: userId } = currentUser;
    const { roomId } = filterMessageDto;

    try {
      const room = await this.roomService.findRoomById(roomId);
      this.verifyUserAuthorization(room.members, userId);

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
    const userId = currentUser.id;

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
    const userId = currentUser.id;
    const { roomId, messageIds } = deleteMessageDto;

    try {
      const room = await this.roomService.findRoomById(roomId);
      this.verifyUserAuthorization(room.members, userId);

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
      const token: string = socket.handshake.headers.token as string;
      if (!token) {
        throw new UnauthorizedException(
          'No authentication token provided via handshake.auth.',
        );
      }
      const userPayload = this.jwtService.verify<UserPayload>(token, {
        secret: this.jwtSecret,
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

    const rooms = await this.roomService.findByUserId(userPayload.id);
    this.server.to(socket.id).emit('userAllRooms', rooms);
    this.logger.log(
      `Client connected: ${socket.id} - User ID: ${userPayload.id}`,
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
    const isMember = members.some((member) => member.id === userId);
    if (!isMember) {
      throw new WsException(
        `Operation failed: You are not authorized to perform this action.`,
      );
    }
  }

  private validateRoomTypeAndParticipants(
    operation: 'create' | 'assign' | 'delete',
    roomType: string,
    participants: string[],
    userId: string,
  ): void {
    if (participants.includes(userId)) {
      throw new WsException(
        'Host should not be included in participants list.',
      );
    }

    if (new Set(participants).size !== participants.length) {
      throw new WsException('Participants list contains duplicates.');
    }

    if (roomType === RoomTypeEnum.PRIVATE) {
      if (operation === 'create' && participants.length !== 1) {
        throw new WsException(
          'Private chat must have exactly one participant.',
        );
      }
      if (operation === 'assign' || operation === 'delete') {
        throw new WsException(`Cannot ${operation} users in private chat.`);
      }
    }

    if (roomType === RoomTypeEnum.GROUP) {
      if (
        participants.length < 1 &&
        (operation === 'assign' || operation === 'delete')
      ) {
        throw new WsException(
          `Cannot ${operation} ${participants.length} users`,
        );
      }
    }
  }

  private async notifyRoomParticipants(
    members: User[],
    event: string,
    payload: any,
  ): Promise<void> {
    const connectedUsers =
      await this.connectedUserService.findConnectedUsersByUserIds(
        members.map((member) => member.id),
      );

    const notificationPromises = connectedUsers.map((user) => ({
      socketId: user.socketId,
      promise: this.emitToSocket(user.socketId, event, payload),
    }));

    const results = await Promise.allSettled(
      notificationPromises.map((np) => np.promise),
    );

    const failures = results.filter((r) => r.status === 'rejected').length;
    if (failures > 0) {
      this.logger.warn(
        `Failed to notify ${failures}/${connectedUsers.length} users for event '${event}'`,
      );
    }
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
          secret: this.jwtRefreshSecret,
        },
      );

      if (refreshPayload.id !== currentUser.id) {
        throw new WsException('Invalid refresh token.');
      }

      const newAccessToken = this.jwtService.sign(
        { id: currentUser.id, email: currentUser.email },
        { secret: this.jwtSecret, expiresIn: this.jwtExpire },
      );

      socket.emit('tokenRefreshed', { accessToken: newAccessToken });
      this.logger.log(
        `Token refreshed successfully for User ID ${currentUser.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Token refresh failed for User ID ${currentUser.id}: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while refreshing token.');
    }
  }
}
