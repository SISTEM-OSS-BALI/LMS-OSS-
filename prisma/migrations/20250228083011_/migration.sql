-- CreateTable
CREATE TABLE `StudentAnswerMockTest` (
    `answer_id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `mock_test_id` VARCHAR(191) NOT NULL,
    `base_mock_test_id` VARCHAR(191) NOT NULL,
    `reading_question_id` VARCHAR(191) NULL,
    `listening_question_id` VARCHAR(191) NULL,
    `writing_question_id` VARCHAR(191) NULL,
    `speaking_test_id` VARCHAR(191) NULL,
    `studentAnswer` LONGTEXT NULL,
    `recording_url` VARCHAR(191) NULL,
    `isCorrect` BOOLEAN NULL,
    `score` INTEGER NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`answer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StudentAnswerMockTest` ADD CONSTRAINT `StudentAnswerMockTest_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerMockTest` ADD CONSTRAINT `StudentAnswerMockTest_mock_test_id_fkey` FOREIGN KEY (`mock_test_id`) REFERENCES `MockTest`(`mock_test_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerMockTest` ADD CONSTRAINT `StudentAnswerMockTest_base_mock_test_id_fkey` FOREIGN KEY (`base_mock_test_id`) REFERENCES `BaseMockTest`(`base_mock_test_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerMockTest` ADD CONSTRAINT `StudentAnswerMockTest_reading_question_id_fkey` FOREIGN KEY (`reading_question_id`) REFERENCES `ReadingQuestion`(`question_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerMockTest` ADD CONSTRAINT `StudentAnswerMockTest_listening_question_id_fkey` FOREIGN KEY (`listening_question_id`) REFERENCES `ListeningQuestion`(`question_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerMockTest` ADD CONSTRAINT `StudentAnswerMockTest_writing_question_id_fkey` FOREIGN KEY (`writing_question_id`) REFERENCES `WritingQuestion`(`question_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerMockTest` ADD CONSTRAINT `StudentAnswerMockTest_speaking_test_id_fkey` FOREIGN KEY (`speaking_test_id`) REFERENCES `SpeakingMockTest`(`speaking_id`) ON DELETE SET NULL ON UPDATE CASCADE;
