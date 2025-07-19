-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('STUDY', 'HOBBY', 'PROJECT', 'DELIVERY', 'ROOMMATE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "major" TEXT NOT NULL,
    "refreshToken" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "PostType" NOT NULL,
    "tags" TEXT[],
    "authorId" TEXT NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoommateDetails" (
    "id" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "room" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "refrigerator" BOOLEAN NOT NULL,
    "wifi" BOOLEAN NOT NULL,
    "snoring" BOOLEAN NOT NULL,
    "smoking" BOOLEAN NOT NULL,
    "sleepTime" TEXT NOT NULL,
    "wakeUpTime" TEXT NOT NULL,
    "mbti" TEXT NOT NULL,
    "rmRefrigerator" BOOLEAN NOT NULL,
    "rmWifi" BOOLEAN NOT NULL,
    "rmSnoring" BOOLEAN NOT NULL,
    "rmSmoking" BOOLEAN NOT NULL,
    "rmMbti" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "RoommateDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PostParticipants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PostParticipants_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RoommateDetails_postId_key" ON "RoommateDetails"("postId");

-- CreateIndex
CREATE INDEX "_PostParticipants_B_index" ON "_PostParticipants"("B");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommateDetails" ADD CONSTRAINT "RoommateDetails_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostParticipants" ADD CONSTRAINT "_PostParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostParticipants" ADD CONSTRAINT "_PostParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
