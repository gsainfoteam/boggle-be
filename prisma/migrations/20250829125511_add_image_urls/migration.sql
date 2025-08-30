-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "public"."Post" ADD COLUMN     "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
