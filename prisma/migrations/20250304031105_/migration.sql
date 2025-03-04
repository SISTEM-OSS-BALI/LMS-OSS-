-- CreateTable
CREATE TABLE `ScorePlacementTest` (
    `score_placement_test_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `placement_test_id` VARCHAR(191) NOT NULL,
    `totalScore` INTEGER NOT NULL,
    `percentageScore` DOUBLE NOT NULL,
    `level` VARCHAR(191) NOT NULL,
    `writingFeedback` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`score_placement_test_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ScorePlacementTest` ADD CONSTRAINT `ScorePlacementTest_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScorePlacementTest` ADD CONSTRAINT `ScorePlacementTest_placement_test_id_fkey` FOREIGN KEY (`placement_test_id`) REFERENCES `PlacementTest`(`placement_test_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
