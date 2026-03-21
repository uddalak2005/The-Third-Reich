/*
  Warnings:

  - You are about to drop the column `hollowkeyId` on the `keyShard` table. All the data in the column will be lost.
  - Added the required column `hollowkey_id` to the `keyShard` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "keyShard" DROP CONSTRAINT "keyShard_hollowkeyId_fkey";

-- DropIndex
DROP INDEX "keyShard_hollowkeyId_idx";

-- AlterTable
ALTER TABLE "keyShard" DROP COLUMN "hollowkeyId",
ADD COLUMN     "hollowkey_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "keyShard_hollowkey_id_idx" ON "keyShard"("hollowkey_id");

-- AddForeignKey
ALTER TABLE "keyShard" ADD CONSTRAINT "keyShard_hollowkey_id_fkey" FOREIGN KEY ("hollowkey_id") REFERENCES "Hollowkey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
