-- CreateTable
CREATE TABLE `ScoreFreePlacementTest` (
    `score_placement_test_id` VARCHAR(191) NOT NULL,
    `participant_id` VARCHAR(191) NOT NULL,
    `placement_test_id` VARCHAR(191) NOT NULL,
    `totalScore` INTEGER NOT NULL,
    `percentageScore` DOUBLE NOT NULL,
    `level` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`score_placement_test_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ScoreFreePlacementTest` ADD CONSTRAINT `ScoreFreePlacementTest_placement_test_id_fkey` FOREIGN KEY (`placement_test_id`) REFERENCES `PlacementTest`(`placement_test_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScoreFreePlacementTest` ADD CONSTRAINT `ScoreFreePlacementTest_participant_id_fkey` FOREIGN KEY (`participant_id`) REFERENCES `PlacementTestParticipant`(`participant_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
