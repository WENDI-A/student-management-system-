-- AlterTable
ALTER TABLE `admin` ALTER COLUMN `deletedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `director` ALTER COLUMN `deletedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `guest` ALTER COLUMN `deletedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `parent` ALTER COLUMN `deletedAt` DROP DEFAULT;
