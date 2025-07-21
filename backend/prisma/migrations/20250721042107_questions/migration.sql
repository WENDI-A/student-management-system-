/*
  Warnings:

  - You are about to drop the column `mark` on the `assessment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `admin` ALTER COLUMN `deletedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `assessment` DROP COLUMN `mark`;

-- AlterTable
ALTER TABLE `director` ALTER COLUMN `deletedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `guest` ALTER COLUMN `deletedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `parent` ALTER COLUMN `deletedAt` DROP DEFAULT;
