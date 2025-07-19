/*
  Warnings:

  - You are about to drop the column `email` on the `ConnectedUser` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ConnectedUser" DROP CONSTRAINT "ConnectedUser_userId_email_fkey";

-- AlterTable
ALTER TABLE "ConnectedUser" DROP COLUMN "email";

-- AddForeignKey
ALTER TABLE "ConnectedUser" ADD CONSTRAINT "ConnectedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
