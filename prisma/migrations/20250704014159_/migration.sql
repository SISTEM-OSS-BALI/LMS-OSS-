-- AlterTable
ALTER TABLE `User` ADD COLUMN `type_student` ENUM('INDIVIDUAL', 'GROUP') NOT NULL DEFAULT 'INDIVIDUAL',
    ADD COLUMN `userGroupUser_group_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `UserGroup` (
    `user_group_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `no_phone` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`user_group_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_userGroupUser_group_id_fkey` FOREIGN KEY (`userGroupUser_group_id`) REFERENCES `UserGroup`(`user_group_id`) ON DELETE SET NULL ON UPDATE CASCADE;
