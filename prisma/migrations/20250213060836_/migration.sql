/*
  Warnings:

  - Added the required column `student_id` to the `Section` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Certificate` ADD COLUMN `is_download` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `Section` ADD COLUMN `student_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Section` ADD CONSTRAINT `Section_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
