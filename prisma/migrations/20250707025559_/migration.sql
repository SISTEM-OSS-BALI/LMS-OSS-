-- DropForeignKey
ALTER TABLE `Section` DROP FOREIGN KEY `Section_student_id_fkey`;

-- AlterTable
ALTER TABLE `Section` ADD COLUMN `user_group_id` VARCHAR(191) NULL,
    MODIFY `student_id` VARCHAR(191) NULL;
