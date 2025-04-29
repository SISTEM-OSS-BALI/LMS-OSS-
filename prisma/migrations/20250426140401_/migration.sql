/*
  Warnings:

  - Added the required column `student_id` to the `TeacherAbsence` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `TeacherAbsence` ADD COLUMN `student_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `TeacherAbsence` ADD CONSTRAINT `TeacherAbsence_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
