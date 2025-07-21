/*
  Warnings:

  - Added the required column `mark` to the `Assessment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `admin` ALTER COLUMN `deletedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `assessment` ADD COLUMN `mark` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `director` ALTER COLUMN `deletedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `guest` ALTER COLUMN `deletedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `parent` ALTER COLUMN `deletedAt` DROP DEFAULT;
