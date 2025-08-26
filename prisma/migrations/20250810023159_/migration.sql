/*
  Warnings:

  - You are about to drop the `ScheduleDay` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScheduleTeacher` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScheduleTime` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ScheduleDay` DROP FOREIGN KEY `ScheduleDay_schedule_id_fkey`;

-- DropForeignKey
ALTER TABLE `ScheduleTeacher` DROP FOREIGN KEY `ScheduleTeacher_teacher_id_fkey`;

-- DropForeignKey
ALTER TABLE `ScheduleTime` DROP FOREIGN KEY `ScheduleTime_day_id_fkey`;

-- DropTable
DROP TABLE `ScheduleDay`;

-- DropTable
DROP TABLE `ScheduleTeacher`;

-- DropTable
DROP TABLE `ScheduleTime`;

-- CreateTable
CREATE TABLE `ScheduleMonth` (
    `id` VARCHAR(191) NOT NULL,
    `teacher_id` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ScheduleMonth_teacher_id_year_month_key`(`teacher_id`, `year`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScheduleBlock` (
    `id` VARCHAR(191) NOT NULL,
    `schedule_month_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT '',
    `color` VARCHAR(191) NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `start_time` DATETIME(3) NULL,
    `end_time` DATETIME(3) NULL,
    `allDay` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ScheduleBlock_schedule_month_id_idx`(`schedule_month_id`),
    INDEX `ScheduleBlock_start_date_idx`(`start_date`),
    INDEX `ScheduleBlock_end_date_idx`(`end_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ScheduleMonth` ADD CONSTRAINT `ScheduleMonth_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScheduleBlock` ADD CONSTRAINT `ScheduleBlock_schedule_month_id_fkey` FOREIGN KEY (`schedule_month_id`) REFERENCES `ScheduleMonth`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
