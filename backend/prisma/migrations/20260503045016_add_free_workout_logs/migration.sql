-- CreateTable
CREATE TABLE "free_workout_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dayName" TEXT,
    "duration" INTEGER,
    "exercises" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "free_workout_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "free_workout_logs" ADD CONSTRAINT "free_workout_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
