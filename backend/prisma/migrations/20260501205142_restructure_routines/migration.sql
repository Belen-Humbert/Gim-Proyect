/*
  Warnings:

  - You are about to drop the column `day` on the `routine_exercises` table. All the data in the column will be lost.
  - You are about to drop the column `routineId` on the `routine_exercises` table. All the data in the column will be lost.
  - You are about to drop the column `trainerId` on the `routines` table. All the data in the column will be lost.
  - You are about to drop the column `completed` on the `workout_logs` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `workout_logs` table. All the data in the column will be lost.
  - You are about to drop the column `day` on the `workout_logs` table. All the data in the column will be lost.
  - You are about to drop the `user_routines` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,routineDayId]` on the table `workout_logs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `routineDayId` to the `routine_exercises` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `routines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `completedAt` to the `workout_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `routineDayId` to the `workout_logs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "routine_exercises" DROP CONSTRAINT "routine_exercises_routineId_fkey";

-- DropForeignKey
ALTER TABLE "routines" DROP CONSTRAINT "routines_trainerId_fkey";

-- DropForeignKey
ALTER TABLE "user_routines" DROP CONSTRAINT "user_routines_routineId_fkey";

-- DropForeignKey
ALTER TABLE "user_routines" DROP CONSTRAINT "user_routines_userId_fkey";

-- AlterTable
ALTER TABLE "routine_exercises" DROP COLUMN "day",
DROP COLUMN "routineId",
ADD COLUMN     "routineDayId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "routines" DROP COLUMN "trainerId",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "workout_logs" DROP COLUMN "completed",
DROP COLUMN "date",
DROP COLUMN "day",
ADD COLUMN     "completedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "routineDayId" TEXT NOT NULL;

-- DropTable
DROP TABLE "user_routines";

-- DropEnum
DROP TYPE "DayOfWeek";

-- CreateTable
CREATE TABLE "routine_days" (
    "id" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routine_days_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workout_logs_userId_routineDayId_key" ON "workout_logs"("userId", "routineDayId");

-- AddForeignKey
ALTER TABLE "routines" ADD CONSTRAINT "routines_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_days" ADD CONSTRAINT "routine_days_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "routines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_exercises" ADD CONSTRAINT "routine_exercises_routineDayId_fkey" FOREIGN KEY ("routineDayId") REFERENCES "routine_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_routineDayId_fkey" FOREIGN KEY ("routineDayId") REFERENCES "routine_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;
