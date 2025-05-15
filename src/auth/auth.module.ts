import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    JwtService,
    JwtStrategy,
    AuthRepository,
  ],
})
export class AuthModule {}
