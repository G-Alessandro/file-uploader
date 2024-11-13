/*
  Warnings:

  - Added the required column `category` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shareFolder` to the `Folder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "category" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "shareFolder" BOOLEAN NOT NULL;
