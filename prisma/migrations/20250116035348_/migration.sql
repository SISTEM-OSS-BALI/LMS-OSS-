-- AlterTable
ALTER TABLE `Meeting` ADD COLUMN `absent` BOOLEAN NULL,
    ADD COLUMN `module` LONGBLOB NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `joined_at` DATETIME(3) NULL,
    ADD COLUMN `program_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Program` (
    `program_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `count_program` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`program_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_program_id_fkey` FOREIGN KEY (`program_id`) REFERENCES `Program`(`program_id`) ON DELETE SET NULL ON UPDATE CASCADE;
