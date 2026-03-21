/*
  Warnings:

  - You are about to drop the `Hollowkey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `keyShard` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "KeyStatus" AS ENUM ('ACTIVE', 'DEACTIVATED', 'EXPIRED');

-- DropForeignKey
ALTER TABLE "KeyEvent" DROP CONSTRAINT "KeyEvent_hollowKeyId_fkey";

-- DropForeignKey
ALTER TABLE "keyShard" DROP CONSTRAINT "keyShard_hollowkeyId_fkey";

-- AlterTable
ALTER TABLE "KeyEvent" ADD COLUMN     "metadata" JSONB;

-- DropTable
DROP TABLE "Hollowkey";

-- DropTable
DROP TABLE "keyShard";

-- DropEnum
DROP TYPE "keyStatus";

-- CreateTable
CREATE TABLE "HollowKey" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "agentId" VARCHAR(255) NOT NULL,
    "agentName" VARCHAR(255) NOT NULL,
    "provider" VARCHAR(255) NOT NULL,
    "allowedIntent" TEXT NOT NULL,
    "status" "KeyStatus" NOT NULL DEFAULT 'ACTIVE',
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HollowKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyShard" (
    "id" TEXT NOT NULL,
    "hollowKeyId" TEXT NOT NULL,
    "shardIndex" INTEGER NOT NULL,
    "vaultLocation" VARCHAR(255) NOT NULL,
    "shardHash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KeyShard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HollowKey_status_idx" ON "HollowKey"("status");

-- CreateIndex
CREATE INDEX "HollowKey_userId_idx" ON "HollowKey"("userId");

-- CreateIndex
CREATE INDEX "KeyShard_hollowKeyId_idx" ON "KeyShard"("hollowKeyId");

-- AddForeignKey
ALTER TABLE "KeyShard" ADD CONSTRAINT "KeyShard_hollowKeyId_fkey" FOREIGN KEY ("hollowKeyId") REFERENCES "HollowKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyEvent" ADD CONSTRAINT "KeyEvent_hollowKeyId_fkey" FOREIGN KEY ("hollowKeyId") REFERENCES "HollowKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
