-- AlterTable
ALTER TABLE `Meeting` ADD COLUMN `dateCancelled` DATETIME(3) NULL,
    ADD COLUMN `is_cancelled` BOOLEAN NULL;
