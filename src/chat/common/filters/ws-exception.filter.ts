import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(WsException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    const data = host.switchToWs().getData();

    this.logger.error(
      `WebSocket Exception: ${exception.message}`,
      exception.stack,
      `Event: ${host.getArgs()[0]} | Data: ${JSON.stringify(data)}`,
    );

    const errorResponse = {
      event: 'exception',
      data: {
        status: 'error',
        message: exception.message,
      },
    };

    client.emit(errorResponse.event, errorResponse.data);
  }
}
