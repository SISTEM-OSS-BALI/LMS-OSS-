/*
  Warnings:

  - Added the required column `program_name` to the `RescheduleMeeting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `RescheduleMeeting` ADD COLUMN `program_name` VARCHAR(191) NOT NULL;
