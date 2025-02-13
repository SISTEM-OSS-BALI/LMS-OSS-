/*
  Warnings:

  - You are about to drop the column `comment` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `Certificate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Certificate` DROP COLUMN `comment`,
    DROP COLUMN `level`,
    DROP COLUMN `section`;

-- CreateTable
CREATE TABLE `Section` (
    `section_id` VARCHAR(191) NOT NULL,
    `section_type` ENUM('READING', 'SPEAKING', 'LISTENING', 'WRITING') NOT NULL,
    `level` VARCHAR(191) NOT NULL,
    `comment` VARCHAR(191) NOT NULL,
    `certificate_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`section_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Section` ADD CONSTRAINT `Section_certificate_id_fkey` FOREIGN KEY (`certificate_id`) REFERENCES `Certificate`(`certificate_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
