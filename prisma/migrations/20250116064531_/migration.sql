/*
  Warnings:

  - You are about to drop the column `description` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `joined_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `program_id` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_program_id_fkey`;

-- AlterTable
ALTER TABLE `Program` DROP COLUMN `description`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `joined_at`,
    DROP COLUMN `program_id`;

-- CreateTable
CREATE TABLE `UserProgram` (
    `user_id` VARCHAR(191) NOT NULL,
    `program_id` VARCHAR(191) NOT NULL,
    `count_program` INTEGER NULL,
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`user_id`, `program_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserProgram` ADD CONSTRAINT `UserProgram_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserProgram` ADD CONSTRAINT `UserProgram_program_id_fkey` FOREIGN KEY (`program_id`) REFERENCES `Program`(`program_id`) ON DELETE CASCADE ON UPDATE CASCADE;
