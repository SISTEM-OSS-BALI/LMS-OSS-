/*
  Warnings:

  - You are about to drop the column `mockTestParticipantParticipant_id` on the `ScoreFreePlacementTest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `ScoreFreePlacementTest` DROP FOREIGN KEY `ScoreFreePlacementTest_mockTestParticipantParticipant_id_fkey`;

-- AlterTable
ALTER TABLE `ScoreFreePlacementTest` DROP COLUMN `mockTestParticipantParticipant_id`;
