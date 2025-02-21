/*
  Warnings:

  - You are about to drop the `TrueFalsePlacementTest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `StudentAnswerPlacementTest` DROP FOREIGN KEY `StudentAnswerPlacementTest_tf_id_fkey`;

-- DropForeignKey
ALTER TABLE `TrueFalsePlacementTest` DROP FOREIGN KEY `TrueFalsePlacementTest_basePlacementTestId_fkey`;

-- AlterTable
ALTER TABLE `StudentAnswerPlacementTest` ADD COLUMN `group_id` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `TrueFalsePlacementTest`;

-- CreateTable
CREATE TABLE `TrueFalseGroupPlacementTest` (
    `group_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `passage` LONGTEXT NOT NULL,
    `basePlacementTestId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`group_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrueFalseQuestion` (
    `tf_id` VARCHAR(191) NOT NULL,
    `question` LONGTEXT NOT NULL,
    `correctAnswer` BOOLEAN NOT NULL,
    `group_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`tf_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TrueFalseGroupPlacementTest` ADD CONSTRAINT `TrueFalseGroupPlacementTest_basePlacementTestId_fkey` FOREIGN KEY (`basePlacementTestId`) REFERENCES `BasePlacementTest`(`base_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrueFalseQuestion` ADD CONSTRAINT `TrueFalseQuestion_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `TrueFalseGroupPlacementTest`(`group_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerPlacementTest` ADD CONSTRAINT `StudentAnswerPlacementTest_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `TrueFalseGroupPlacementTest`(`group_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerPlacementTest` ADD CONSTRAINT `StudentAnswerPlacementTest_tf_id_fkey` FOREIGN KEY (`tf_id`) REFERENCES `TrueFalseQuestion`(`tf_id`) ON DELETE SET NULL ON UPDATE CASCADE;
