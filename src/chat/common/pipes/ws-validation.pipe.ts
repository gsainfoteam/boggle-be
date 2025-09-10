import { ValidationPipe, ValidationError } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

export class WsValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: false,
      transformOptions: { enableImplicitConversion: true },
      validationError: { target: false, value: true },
      exceptionFactory: (errors: ValidationError[]) =>
        new WsException({
          code: 'WS_VALIDATION',
          message: 'Validation failed',
          errors: errors,
        }),
    });
  }
}
