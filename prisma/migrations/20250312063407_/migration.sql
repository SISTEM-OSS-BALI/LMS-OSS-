-- CreateTable
CREATE TABLE `ScoreMockTest` (
    `score_placement_test_id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `mock_test_id` VARCHAR(191) NOT NULL,
    `totalScore` INTEGER NOT NULL,
    `percentageScore` DOUBLE NOT NULL,
    `level` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`score_placement_test_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ScoreMockTest` ADD CONSTRAINT `ScoreMockTest_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScoreMockTest` ADD CONSTRAINT `ScoreMockTest_mock_test_id_fkey` FOREIGN KEY (`mock_test_id`) REFERENCES `MockTest`(`mock_test_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
