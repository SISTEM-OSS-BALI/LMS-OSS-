/*
  Warnings:

  - The primary key for the `MultipleChoicePlacementTest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `mcq_id` on the `MultipleChoicePlacementTest` table. All the data in the column will be lost.
  - You are about to drop the column `placement_test_id` on the `MultipleChoicePlacementTest` table. All the data in the column will be lost.
  - Added the required column `basePlacementTestId` to the `MultipleChoicePlacementTest` table without a default value. This is not possible if the table is not empty.
  - The required column `mc_id` was added to the `MultipleChoicePlacementTest` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE `MultipleChoicePlacementTest` DROP FOREIGN KEY `MultipleChoicePlacementTest_placement_test_id_fkey`;

-- DropForeignKey
ALTER TABLE `StudentAnswerPlacementTest` DROP FOREIGN KEY `StudentAnswerPlacementTest_mcq_id_fkey`;

-- AlterTable
ALTER TABLE `MultipleChoicePlacementTest` DROP PRIMARY KEY,
    DROP COLUMN `mcq_id`,
    DROP COLUMN `placement_test_id`,
    ADD COLUMN `basePlacementTestId` VARCHAR(191) NOT NULL,
    ADD COLUMN `mc_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`mc_id`);

-- AlterTable
ALTER TABLE `StudentAnswerPlacementTest` ADD COLUMN `tf_id` VARCHAR(191) NULL,
    ADD COLUMN `writing_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `BasePlacementTest` (
    `base_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `placementTestId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`base_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrueFalsePlacementTest` (
    `tf_id` VARCHAR(191) NOT NULL,
    `question` LONGTEXT NOT NULL,
    `correctAnswer` BOOLEAN NOT NULL,
    `basePlacementTestId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`tf_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WritingPlacementTest` (
    `writing_id` VARCHAR(191) NOT NULL,
    `question` LONGTEXT NOT NULL,
    `sampleAnswer` LONGTEXT NOT NULL,
    `basePlacementTestId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`writing_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BasePlacementTest` ADD CONSTRAINT `BasePlacementTest_placementTestId_fkey` FOREIGN KEY (`placementTestId`) REFERENCES `PlacementTest`(`placement_test_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MultipleChoicePlacementTest` ADD CONSTRAINT `MultipleChoicePlacementTest_basePlacementTestId_fkey` FOREIGN KEY (`basePlacementTestId`) REFERENCES `BasePlacementTest`(`base_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrueFalsePlacementTest` ADD CONSTRAINT `TrueFalsePlacementTest_basePlacementTestId_fkey` FOREIGN KEY (`basePlacementTestId`) REFERENCES `BasePlacementTest`(`base_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WritingPlacementTest` ADD CONSTRAINT `WritingPlacementTest_basePlacementTestId_fkey` FOREIGN KEY (`basePlacementTestId`) REFERENCES `BasePlacementTest`(`base_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerPlacementTest` ADD CONSTRAINT `StudentAnswerPlacementTest_mcq_id_fkey` FOREIGN KEY (`mcq_id`) REFERENCES `MultipleChoicePlacementTest`(`mc_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerPlacementTest` ADD CONSTRAINT `StudentAnswerPlacementTest_tf_id_fkey` FOREIGN KEY (`tf_id`) REFERENCES `TrueFalsePlacementTest`(`tf_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerPlacementTest` ADD CONSTRAINT `StudentAnswerPlacementTest_writing_id_fkey` FOREIGN KEY (`writing_id`) REFERENCES `WritingPlacementTest`(`writing_id`) ON DELETE SET NULL ON UPDATE CASCADE;
