/*
  Warnings:

  - A unique constraint covering the columns `[uuid,email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('GROUP', 'PRIVATE');

-- CreateTable
CREATE TABLE "ConnectedUser" (
    "uuid" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "socketId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConnectedUser_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Message" (
    "uuid" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "senderId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Room" (
    "uuid" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roomType" "RoomType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "_RoomMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoomMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedUser_socketId_key" ON "ConnectedUser"("socketId");

-- CreateIndex
CREATE INDEX "_RoomMembers_B_index" ON "_RoomMembers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_email_key" ON "User"("uuid", "email");

-- AddForeignKey
ALTER TABLE "ConnectedUser" ADD CONSTRAINT "ConnectedUser_userId_email_fkey" FOREIGN KEY ("userId", "email") REFERENCES "User"("uuid", "email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomMembers" ADD CONSTRAINT "_RoomMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomMembers" ADD CONSTRAINT "_RoomMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
