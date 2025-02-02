-- CreateTable
CREATE TABLE `PlacementTest` (
    `placement_test_id` VARCHAR(191) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `timeLimit` INTEGER NOT NULL,

    PRIMARY KEY (`placement_test_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MultipleChoicePlacementTest` (
    `mcq_id` VARCHAR(191) NOT NULL,
    `question` LONGTEXT NOT NULL,
    `options` JSON NOT NULL,
    `correctAnswer` VARCHAR(191) NOT NULL,
    `placement_test_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`mcq_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentAnswerAssigmentPlacementTest` (
    `answer_id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `assignment_id` VARCHAR(191) NOT NULL,
    `mcq_id` VARCHAR(191) NULL,
    `studentAnswer` LONGTEXT NOT NULL,
    `isCorrect` BOOLEAN NULL,
    `score` INTEGER NOT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`answer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MultipleChoicePlacementTest` ADD CONSTRAINT `MultipleChoicePlacementTest_placement_test_id_fkey` FOREIGN KEY (`placement_test_id`) REFERENCES `PlacementTest`(`placement_test_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerAssigmentPlacementTest` ADD CONSTRAINT `StudentAnswerAssigmentPlacementTest_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerAssigmentPlacementTest` ADD CONSTRAINT `StudentAnswerAssigmentPlacementTest_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `Assignment`(`assignment_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerAssigmentPlacementTest` ADD CONSTRAINT `StudentAnswerAssigmentPlacementTest_mcq_id_fkey` FOREIGN KEY (`mcq_id`) REFERENCES `MultipleChoicePlacementTest`(`mcq_id`) ON DELETE SET NULL ON UPDATE CASCADE;
