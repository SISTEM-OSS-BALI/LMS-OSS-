-- AlterTable
ALTER TABLE `Section` ADD COLUMN `user_group_id` VARCHAR(191) NULL,
    MODIFY `student_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Section` ADD CONSTRAINT `Section_user_group_id_fkey` FOREIGN KEY (`user_group_id`) REFERENCES `UserGroup`(`user_group_id`) ON DELETE CASCADE ON UPDATE CASCADE;
