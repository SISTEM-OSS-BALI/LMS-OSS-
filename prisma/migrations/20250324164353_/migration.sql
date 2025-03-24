-- DropForeignKey
ALTER TABLE `StudentAnswerFreePlacementTest` DROP FOREIGN KEY `StudentAnswerFreePlacementTest_participant_id_fkey`;

-- AddForeignKey
ALTER TABLE `StudentAnswerFreePlacementTest` ADD CONSTRAINT `StudentAnswerFreePlacementTest_participant_id_fkey` FOREIGN KEY (`participant_id`) REFERENCES `PlacementTestParticipant`(`participant_id`) ON DELETE CASCADE ON UPDATE CASCADE;
