import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PostRepository } from './post.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PostController],
  providers: [PostService, PostRepository],
})
export class PostModule {}
