-- CreateEnum
CREATE TYPE "keyStatus" AS ENUM ('ACTIVE', 'DEACTIVATED', 'EXPIRED');

-- CreateTable
CREATE TABLE "Hollowkey" (
    "id" TEXT NOT NULL,
    "agent_name" VARCHAR(255),
    "agent_id" VARCHAR(255),
    "provider" VARCHAR(255) NOT NULL,
    "allowed_intent" TEXT NOT NULL,
    "status" "keyStatus" NOT NULL,
    "times_used" INTEGER NOT NULL DEFAULT 0,
    "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expired_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hollowkey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keyShard" (
    "id" TEXT NOT NULL,
    "hollowkeyId" TEXT NOT NULL,
    "shard_index" INTEGER NOT NULL,
    "vault_location" VARCHAR(255) NOT NULL,
    "shard_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "keyShard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Hollowkey_status_idx" ON "Hollowkey"("status");

-- CreateIndex
CREATE INDEX "keyShard_hollowkeyId_idx" ON "keyShard"("hollowkeyId");

-- AddForeignKey
ALTER TABLE "keyShard" ADD CONSTRAINT "keyShard_hollowkeyId_fkey" FOREIGN KEY ("hollowkeyId") REFERENCES "Hollowkey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
