/*
  Warnings:

  - Added the required column `new_dateTime` to the `RescheduleMeeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacher_name` to the `RescheduleMeeting` table without a default value. This is not possible if the table is not empty.
  - Made the column `status` on table `RescheduleMeeting` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `RescheduleMeeting` ADD COLUMN `new_dateTime` DATETIME(3) NOT NULL,
    ADD COLUMN `new_endTime` DATETIME(3) NULL,
    ADD COLUMN `new_method` ENUM('ONLINE', 'OFFLINE') NULL,
    ADD COLUMN `new_platform` VARCHAR(191) NULL,
    ADD COLUMN `new_startTime` DATETIME(3) NULL,
    ADD COLUMN `teacher_name` VARCHAR(191) NOT NULL,
    MODIFY `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';
