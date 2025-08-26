/*
  Warnings:

  - You are about to drop the column `teacher_id` on the `ShiftSchedule` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `ShiftSchedule` DROP FOREIGN KEY `ShiftSchedule_teacher_id_fkey`;

-- DropIndex
DROP INDEX `ShiftSchedule_teacher_id_start_time_end_time_key` ON `ShiftSchedule`;

-- AlterTable
ALTER TABLE `ShiftSchedule` DROP COLUMN `teacher_id`;
