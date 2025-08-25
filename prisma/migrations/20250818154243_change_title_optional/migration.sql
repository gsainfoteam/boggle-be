-- AlterEnum
ALTER TYPE "PostType" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "title" DROP NOT NULL;
