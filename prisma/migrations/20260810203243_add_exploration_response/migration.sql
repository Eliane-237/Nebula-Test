-- CreateTable
CREATE TABLE "ExplorationResponse" (
    "id" TEXT NOT NULL,
    "explorationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "coachFeedback" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExplorationResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExplorationResponse_explorationId_userId_key" ON "ExplorationResponse"("explorationId", "userId");

-- AddForeignKey
ALTER TABLE "ExplorationResponse" ADD CONSTRAINT "ExplorationResponse_explorationId_fkey" FOREIGN KEY ("explorationId") REFERENCES "Exploration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExplorationResponse" ADD CONSTRAINT "ExplorationResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
