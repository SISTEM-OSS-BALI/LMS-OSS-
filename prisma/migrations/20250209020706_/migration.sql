/*
  Warnings:

  - Added the required column `student_id` to the `RescheduleMeeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_name` to the `RescheduleMeeting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `RescheduleMeeting` ADD COLUMN `student_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `student_name` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `RescheduleMeeting` ADD CONSTRAINT `RescheduleMeeting_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
