/*
  Warnings:

  - You are about to alter the column `category` on the `File` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE "File" ALTER COLUMN "category" SET DATA TYPE VARCHAR(20);
