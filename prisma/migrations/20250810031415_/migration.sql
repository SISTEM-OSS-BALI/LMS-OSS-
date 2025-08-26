/*
  Warnings:

  - You are about to drop the column `end_time` on the `ScheduleBlock` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `ScheduleBlock` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ScheduleBlock` DROP COLUMN `end_time`,
    DROP COLUMN `start_time`;

-- CreateTable
CREATE TABLE `ScheduleBlockTime` (
    `id` VARCHAR(191) NOT NULL,
    `block_id` VARCHAR(191) NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,
    `cross_midnight` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ScheduleBlockTime_block_id_idx`(`block_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ScheduleBlockTime` ADD CONSTRAINT `ScheduleBlockTime_block_id_fkey` FOREIGN KEY (`block_id`) REFERENCES `ScheduleBlock`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
