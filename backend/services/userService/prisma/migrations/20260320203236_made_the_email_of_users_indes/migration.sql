/*
  Warnings:

  - Added the required column `username` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "username" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE INDEX "Users_email_idx" ON "Users"("email");
