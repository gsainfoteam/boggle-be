import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserRepository } from './user.repository';
import { HttpModule } from '@nestjs/axios';
import { IdPStrategy } from './guard/idp.strategy';
@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, IdPStrategy],
})
export class UserModule {}
