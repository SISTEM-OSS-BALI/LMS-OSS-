/*
  Warnings:

  - You are about to drop the `ScheduleBlockTime` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ScheduleBlockTime` DROP FOREIGN KEY `ScheduleBlockTime_block_id_fkey`;

-- DropTable
DROP TABLE `ScheduleBlockTime`;

-- CreateTable
CREATE TABLE `ScheduleBlockShift` (
    `id` VARCHAR(191) NOT NULL,
    `block_id` VARCHAR(191) NOT NULL,
    `shift_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ScheduleBlockShift_block_id_idx`(`block_id`),
    INDEX `ScheduleBlockShift_shift_id_idx`(`shift_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShiftSchedule` (
    `id` VARCHAR(191) NOT NULL,
    `teacher_id` VARCHAR(191) NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ShiftSchedule_teacher_id_start_time_end_time_key`(`teacher_id`, `start_time`, `end_time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ScheduleBlockShift` ADD CONSTRAINT `ScheduleBlockShift_block_id_fkey` FOREIGN KEY (`block_id`) REFERENCES `ScheduleBlock`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScheduleBlockShift` ADD CONSTRAINT `ScheduleBlockShift_shift_id_fkey` FOREIGN KEY (`shift_id`) REFERENCES `ShiftSchedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShiftSchedule` ADD CONSTRAINT `ShiftSchedule_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
