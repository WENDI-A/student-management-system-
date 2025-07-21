/*
  Warnings:

  - Added the required column `type` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `question` DROP FOREIGN KEY `Question_assessmentId_fkey`;

-- DropIndex
DROP INDEX `Question_assessmentId_fkey` ON `question`;

-- AlterTable
ALTER TABLE `admin` ALTER COLUMN `deletedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `assessment` ADD COLUMN `totalMarks` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `director` ALTER COLUMN `deletedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `guest` ALTER COLUMN `deletedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `parent` ALTER COLUMN `deletedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `question` ADD COLUMN `correctAnswer` VARCHAR(191) NULL,
    ADD COLUMN `marks` DOUBLE NOT NULL DEFAULT 1,
    ADD COLUMN `options` JSON NULL,
    ADD COLUMN `order` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `type` ENUM('TRUE_FALSE', 'MULTIPLE_CHOICE', 'FILL_BLANK', 'ESSAY') NOT NULL;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
