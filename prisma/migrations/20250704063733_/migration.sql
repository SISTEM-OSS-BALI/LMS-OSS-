-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_userGroupUser_group_id_fkey`;

-- AlterTable
ALTER TABLE `UserGroup` ADD COLUMN `userUser_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `UserGroup` ADD CONSTRAINT `UserGroup_userUser_id_fkey` FOREIGN KEY (`userUser_id`) REFERENCES `User`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
