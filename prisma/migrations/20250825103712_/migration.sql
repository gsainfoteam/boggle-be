/*
  Warnings:

  - You are about to drop the column `rmMbti` on the `RoommateDetails` table. All the data in the column will be lost.
  - Added the required column `age` to the `RoommateDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `RoommateDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Post" ALTER COLUMN "deadline" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."RoommateDetails" DROP COLUMN "rmMbti",
ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ALTER COLUMN "sleepTime" DROP NOT NULL,
ALTER COLUMN "wakeUpTime" DROP NOT NULL,
ALTER COLUMN "mbti" DROP NOT NULL,
ALTER COLUMN "rmRefrigerator" DROP NOT NULL,
ALTER COLUMN "rmWifi" DROP NOT NULL,
ALTER COLUMN "rmSnoring" DROP NOT NULL,
ALTER COLUMN "rmSmoking" DROP NOT NULL;
