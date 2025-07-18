/*
  Warnings:

  - You are about to drop the column `module` on the `Meeting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Meeting` DROP COLUMN `module`;

-- CreateTable
CREATE TABLE `ProgressMeeting` (
    `progress_id` VARCHAR(191) NOT NULL,
    `meeting_id` VARCHAR(191) NOT NULL,
    `progress_student` LONGTEXT NULL,
    `abilityScale` LONGTEXT NULL,
    `studentPerformance` LONGTEXT NULL,

    PRIMARY KEY (`progress_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProgressMeeting` ADD CONSTRAINT `ProgressMeeting_meeting_id_fkey` FOREIGN KEY (`meeting_id`) REFERENCES `Meeting`(`meeting_id`) ON DELETE CASCADE ON UPDATE CASCADE;
