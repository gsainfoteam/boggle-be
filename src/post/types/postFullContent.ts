import { Prisma } from '@prisma/client';

export type PostFullContent = Prisma.PostGetPayload<{
  include: {
    author: {
      select: {
        uuid: true;
        name: true;
      };
    };
    participants: {
      select: {
        uuid: true;
        name: true;
      };
    };
  };
}>;
