-- CreateTable
CREATE TABLE "sandbox_logs" (
    "id" UUID NOT NULL,
    "sandboxId" VARCHAR(255) NOT NULL,
    "agentId" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "command" TEXT[],
    "intent" TEXT NOT NULL,
    "stdout" TEXT,
    "stderr" TEXT,
    "exitCode" INTEGER,
    "status" VARCHAR(50) NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "executedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sandbox_logs_pkey" PRIMARY KEY ("id")
);
