/*
  Warnings:

  - You are about to drop the column `mockTestParticipantParticipant_id` on the `ScoreFreeMockTest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `ScoreFreeMockTest` DROP FOREIGN KEY `ScoreFreeMockTest_mockTestParticipantParticipant_id_fkey`;

-- DropForeignKey
ALTER TABLE `ScoreFreeMockTest` DROP FOREIGN KEY `ScoreFreeMockTest_participant_id_fkey`;

-- AlterTable
ALTER TABLE `ScoreFreeMockTest` DROP COLUMN `mockTestParticipantParticipant_id`;

-- AddForeignKey
ALTER TABLE `ScoreFreeMockTest` ADD CONSTRAINT `ScoreFreeMockTest_participant_id_fkey` FOREIGN KEY (`participant_id`) REFERENCES `MockTestParticipant`(`participant_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
