-- DropForeignKey
ALTER TABLE `PlacementTestParticipant` DROP FOREIGN KEY `PlacementTestParticipant_session_id_fkey`;

-- DropForeignKey
ALTER TABLE `ScoreFreeMockTest` DROP FOREIGN KEY `ScoreFreeMockTest_mock_test_id_fkey`;

-- DropForeignKey
ALTER TABLE `ScoreFreeMockTest` DROP FOREIGN KEY `ScoreFreeMockTest_participant_id_fkey`;

-- AddForeignKey
ALTER TABLE `PlacementTestParticipant` ADD CONSTRAINT `PlacementTestParticipant_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `PlacementTestSession`(`session_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScoreFreeMockTest` ADD CONSTRAINT `ScoreFreeMockTest_mock_test_id_fkey` FOREIGN KEY (`mock_test_id`) REFERENCES `MockTest`(`mock_test_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScoreFreeMockTest` ADD CONSTRAINT `ScoreFreeMockTest_participant_id_fkey` FOREIGN KEY (`participant_id`) REFERENCES `MockTestParticipant`(`participant_id`) ON DELETE CASCADE ON UPDATE CASCADE;
