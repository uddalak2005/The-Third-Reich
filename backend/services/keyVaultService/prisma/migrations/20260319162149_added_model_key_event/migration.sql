-- CreateTable
CREATE TABLE "KeyEvent" (
    "id" TEXT NOT NULL,
    "hollowKeyId" TEXT NOT NULL,
    "eventType" VARCHAR(50) NOT NULL,
    "traceId" VARCHAR(255),
    "agentId" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KeyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KeyEvent_hollowKeyId_idx" ON "KeyEvent"("hollowKeyId");

-- AddForeignKey
ALTER TABLE "KeyEvent" ADD CONSTRAINT "KeyEvent_hollowKeyId_fkey" FOREIGN KEY ("hollowKeyId") REFERENCES "Hollowkey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
