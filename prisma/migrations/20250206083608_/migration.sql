-- AlterTable
ALTER TABLE `User` ADD COLUMN `consultant_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Consultant` (
    `consultant_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`consultant_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_consultant_id_fkey` FOREIGN KEY (`consultant_id`) REFERENCES `Consultant`(`consultant_id`) ON DELETE SET NULL ON UPDATE CASCADE;
