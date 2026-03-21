/*
  Warnings:

  - You are about to drop the column `hollowkey_id` on the `keyShard` table. All the data in the column will be lost.
  - Added the required column `hollowkeyId` to the `keyShard` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "keyShard" DROP CONSTRAINT "keyShard_hollowkey_id_fkey";

-- DropIndex
DROP INDEX "keyShard_hollowkey_id_idx";

-- AlterTable
ALTER TABLE "keyShard" DROP COLUMN "hollowkey_id",
ADD COLUMN     "hollowkeyId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "keyShard_hollowkeyId_idx" ON "keyShard"("hollowkeyId");

-- AddForeignKey
ALTER TABLE "keyShard" ADD CONSTRAINT "keyShard_hollowkeyId_fkey" FOREIGN KEY ("hollowkeyId") REFERENCES "Hollowkey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
