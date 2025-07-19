import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UserPayload } from 'src/types/user-payload.type';

export const WsCurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserPayload => {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const user = client.data?.user;
    if (!user || typeof user !== 'object' || !user.uuid) {
      throw new Error('유효하지 않은 사용자 데이터입니다');
    }
    return user as UserPayload;
  },
);
