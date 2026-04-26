/*
  Warnings:

  - A unique constraint covering the columns `[dni]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "dni" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_dni_key" ON "users"("dni");
