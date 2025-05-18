/*
  Warnings:

  - You are about to drop the column `type` on the `Post` table. All the data in the column will be lost.
  - Added the required column `postType` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('STUDY', 'HOBBY', 'PROJECT', 'DELIVERY', 'ROOMMATE');

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "type",
ADD COLUMN     "postType" "PostType" NOT NULL;

-- DropEnum
DROP TYPE "Type";
