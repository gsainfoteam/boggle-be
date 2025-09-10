import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(WsException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  private safeStringify(data: unknown): string {
    try {
      return JSON.stringify(data);
    } catch {
      return '[Unable to stringify data]';
    }
  }

  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    const data: unknown = host.switchToWs().getData();
    const args = host.getArgs();
    const event = typeof args?.[0] === 'string' ? args[0] : 'unknown';

    this.logger.error(
      `WebSocket Exception: ${exception.message}`,
      exception.stack,
      `Event: ${event} | Data: ${this.safeStringify(data)}`,
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
