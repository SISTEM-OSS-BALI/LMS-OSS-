/*
  Warnings:

  - You are about to drop the column `endTime` on the `TeacherAbsence` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `TeacherAbsence` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ScheduleTime` MODIFY `endTime` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `TeacherAbsence` DROP COLUMN `endTime`,
    DROP COLUMN `startTime`,
    MODIFY `student_id` VARCHAR(191) NULL;
