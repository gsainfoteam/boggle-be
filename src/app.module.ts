import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from '@lib/prisma';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UserModule, PrismaModule, ConfigModule.forRoot({ isGlobal: true })],
})
export class AppModule {}
