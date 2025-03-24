/*
  Warnings:

  - The primary key for the `ScoreFreeMockTest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `score_placement_test_id` on the `ScoreFreeMockTest` table. All the data in the column will be lost.
  - The required column `score_mock_test_id` was added to the `ScoreFreeMockTest` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE `PlacementTestSession` DROP FOREIGN KEY `PlacementTestSession_placement_test_id_fkey`;

-- DropForeignKey
ALTER TABLE `ScoreFreePlacementTest` DROP FOREIGN KEY `ScoreFreePlacementTest_participant_id_fkey`;

-- DropForeignKey
ALTER TABLE `ScoreFreePlacementTest` DROP FOREIGN KEY `ScoreFreePlacementTest_placement_test_id_fkey`;

-- DropForeignKey
ALTER TABLE `StudentAnswerFreePlacementTest` DROP FOREIGN KEY `StudentAnswerFreePlacementTest_placement_test_id_fkey`;

-- AlterTable
ALTER TABLE `ScoreFreeMockTest` DROP PRIMARY KEY,
    DROP COLUMN `score_placement_test_id`,
    ADD COLUMN `score_mock_test_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`score_mock_test_id`);

-- AddForeignKey
ALTER TABLE `PlacementTestSession` ADD CONSTRAINT `PlacementTestSession_placement_test_id_fkey` FOREIGN KEY (`placement_test_id`) REFERENCES `PlacementTest`(`placement_test_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerFreePlacementTest` ADD CONSTRAINT `StudentAnswerFreePlacementTest_placement_test_id_fkey` FOREIGN KEY (`placement_test_id`) REFERENCES `PlacementTest`(`placement_test_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScoreFreePlacementTest` ADD CONSTRAINT `ScoreFreePlacementTest_placement_test_id_fkey` FOREIGN KEY (`placement_test_id`) REFERENCES `PlacementTest`(`placement_test_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScoreFreePlacementTest` ADD CONSTRAINT `ScoreFreePlacementTest_participant_id_fkey` FOREIGN KEY (`participant_id`) REFERENCES `PlacementTestParticipant`(`participant_id`) ON DELETE CASCADE ON UPDATE CASCADE;
