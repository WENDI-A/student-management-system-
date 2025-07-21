/*
  Warnings:

  - Added the required column `day` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `admin` ALTER COLUMN `deletedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `director` ALTER COLUMN `deletedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `guest` ALTER COLUMN `deletedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `parent` ALTER COLUMN `deletedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `schedule` ADD COLUMN `day` VARCHAR(191) NOT NULL;
