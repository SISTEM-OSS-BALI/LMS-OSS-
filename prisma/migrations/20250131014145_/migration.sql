/*
  Warnings:

  - Added the required column `imageUrl` to the `TeacherAbsence` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `TeacherAbsence` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `TeacherAbsence` ADD COLUMN `imageUrl` LONGTEXT NOT NULL,
    ADD COLUMN `reason` VARCHAR(191) NOT NULL;
