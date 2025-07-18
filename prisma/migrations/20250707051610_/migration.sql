/*
  Warnings:

  - Added the required column `type_student` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type_student` to the `Section` table without a default value. This is not possible if the table is not empty.
  - Made the column `student_id` on table `Section` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_group_id` on table `Section` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `Section_student_id_fkey` ON `Section`;

-- AlterTable
ALTER TABLE `Certificate` ADD COLUMN `type_student` ENUM('INDIVIDUAL', 'GROUP') NOT NULL,
    ADD COLUMN `user_group_id` VARCHAR(191) NULL,
    MODIFY `student_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Section` ADD COLUMN `type_student` ENUM('INDIVIDUAL', 'GROUP') NOT NULL,
    MODIFY `student_id` VARCHAR(191) NOT NULL,
    MODIFY `user_group_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Certificate` ADD CONSTRAINT `Certificate_user_group_id_fkey` FOREIGN KEY (`user_group_id`) REFERENCES `UserGroup`(`user_group_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Section` ADD CONSTRAINT `Section_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
