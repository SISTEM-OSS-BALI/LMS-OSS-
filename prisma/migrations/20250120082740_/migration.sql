/*
  Warnings:

  - You are about to drop the `UserProgram` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `UserProgram` DROP FOREIGN KEY `UserProgram_program_id_fkey`;

-- DropForeignKey
ALTER TABLE `UserProgram` DROP FOREIGN KEY `UserProgram_user_id_fkey`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `count_program` INTEGER NULL,
    ADD COLUMN `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `program_id` VARCHAR(191) NULL,
    ADD COLUMN `region` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `UserProgram`;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_program_id_fkey` FOREIGN KEY (`program_id`) REFERENCES `Program`(`program_id`) ON DELETE CASCADE ON UPDATE CASCADE;
