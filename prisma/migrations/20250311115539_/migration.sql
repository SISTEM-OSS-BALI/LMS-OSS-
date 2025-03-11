-- CreateTable
CREATE TABLE `StudentAnswerFreePlacementTest` (
    `answer_id` VARCHAR(191) NOT NULL,
    `participant_id` VARCHAR(191) NOT NULL,
    `placement_test_id` VARCHAR(191) NOT NULL,
    `mcq_id` VARCHAR(191) NULL,
    `group_id` VARCHAR(191) NULL,
    `tf_id` VARCHAR(191) NULL,
    `writing_id` VARCHAR(191) NULL,
    `writing_feedback` LONGTEXT NULL,
    `studentAnswer` LONGTEXT NOT NULL,
    `isCorrect` BOOLEAN NULL,
    `score` INTEGER NOT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `StudentAnswerFreePlacementTest_participant_id_placement_test_idx`(`participant_id`, `placement_test_id`),
    PRIMARY KEY (`answer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StudentAnswerFreePlacementTest` ADD CONSTRAINT `StudentAnswerFreePlacementTest_placement_test_id_fkey` FOREIGN KEY (`placement_test_id`) REFERENCES `PlacementTest`(`placement_test_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerFreePlacementTest` ADD CONSTRAINT `StudentAnswerFreePlacementTest_mcq_id_fkey` FOREIGN KEY (`mcq_id`) REFERENCES `MultipleChoicePlacementTest`(`mc_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerFreePlacementTest` ADD CONSTRAINT `StudentAnswerFreePlacementTest_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `TrueFalseGroupPlacementTest`(`group_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerFreePlacementTest` ADD CONSTRAINT `StudentAnswerFreePlacementTest_tf_id_fkey` FOREIGN KEY (`tf_id`) REFERENCES `TrueFalseQuestion`(`tf_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerFreePlacementTest` ADD CONSTRAINT `StudentAnswerFreePlacementTest_writing_id_fkey` FOREIGN KEY (`writing_id`) REFERENCES `WritingPlacementTest`(`writing_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerFreePlacementTest` ADD CONSTRAINT `StudentAnswerFreePlacementTest_participant_id_fkey` FOREIGN KEY (`participant_id`) REFERENCES `PlacementTestParticipant`(`participant_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
