-- AlterTable
ALTER TABLE `ScoreFreePlacementTest` ADD COLUMN `mockTestParticipantParticipant_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `MockTestSession` (
    `session_id` VARCHAR(191) NOT NULL,
    `mock_test_id` VARCHAR(191) NOT NULL,
    `sessionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`session_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MockTestParticipant` (
    `participant_id` VARCHAR(191) NOT NULL,
    `session_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `institution` VARCHAR(191) NOT NULL,
    `grade` VARCHAR(191) NOT NULL,
    `social_media` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `MockTestParticipant_email_key`(`email`),
    PRIMARY KEY (`participant_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentAnswerFreeMockTest` (
    `answer_id` VARCHAR(191) NOT NULL,
    `participant_id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `mock_test_id` VARCHAR(191) NOT NULL,
    `base_mock_test_id` VARCHAR(191) NOT NULL,
    `reading_question_id` VARCHAR(191) NULL,
    `listening_question_id` VARCHAR(191) NULL,
    `writing_question_id` VARCHAR(191) NULL,
    `speaking_test_id` VARCHAR(191) NULL,
    `studentAnswer` LONGTEXT NULL,
    `recording_url` LONGTEXT NULL,
    `isCorrect` BOOLEAN NULL,
    `score` INTEGER NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`answer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScoreFreeMockTest` (
    `score_placement_test_id` VARCHAR(191) NOT NULL,
    `participant_id` VARCHAR(191) NOT NULL,
    `mock_test_id` VARCHAR(191) NOT NULL,
    `totalScore` INTEGER NOT NULL,
    `percentageScore` DOUBLE NOT NULL,
    `level` VARCHAR(191) NOT NULL,
    `mockTestParticipantParticipant_id` VARCHAR(191) NULL,

    PRIMARY KEY (`score_placement_test_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ScoreFreePlacementTest` ADD CONSTRAINT `ScoreFreePlacementTest_mockTestParticipantParticipant_id_fkey` FOREIGN KEY (`mockTestParticipantParticipant_id`) REFERENCES `MockTestParticipant`(`participant_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MockTestSession` ADD CONSTRAINT `MockTestSession_mock_test_id_fkey` FOREIGN KEY (`mock_test_id`) REFERENCES `MockTest`(`mock_test_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MockTestParticipant` ADD CONSTRAINT `MockTestParticipant_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `MockTestSession`(`session_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerFreeMockTest` ADD CONSTRAINT `StudentAnswerFreeMockTest_participant_id_fkey` FOREIGN KEY (`participant_id`) REFERENCES `MockTestParticipant`(`participant_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerFreeMockTest` ADD CONSTRAINT `StudentAnswerFreeMockTest_mock_test_id_fkey` FOREIGN KEY (`mock_test_id`) REFERENCES `MockTest`(`mock_test_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerFreeMockTest` ADD CONSTRAINT `StudentAnswerFreeMockTest_base_mock_test_id_fkey` FOREIGN KEY (`base_mock_test_id`) REFERENCES `BaseMockTest`(`base_mock_test_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerFreeMockTest` ADD CONSTRAINT `StudentAnswerFreeMockTest_reading_question_id_fkey` FOREIGN KEY (`reading_question_id`) REFERENCES `ReadingQuestion`(`question_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerFreeMockTest` ADD CONSTRAINT `StudentAnswerFreeMockTest_listening_question_id_fkey` FOREIGN KEY (`listening_question_id`) REFERENCES `ListeningQuestion`(`question_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerFreeMockTest` ADD CONSTRAINT `StudentAnswerFreeMockTest_writing_question_id_fkey` FOREIGN KEY (`writing_question_id`) REFERENCES `WritingQuestion`(`question_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerFreeMockTest` ADD CONSTRAINT `StudentAnswerFreeMockTest_speaking_test_id_fkey` FOREIGN KEY (`speaking_test_id`) REFERENCES `SpeakingMockTest`(`speaking_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScoreFreeMockTest` ADD CONSTRAINT `ScoreFreeMockTest_mock_test_id_fkey` FOREIGN KEY (`mock_test_id`) REFERENCES `MockTest`(`mock_test_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScoreFreeMockTest` ADD CONSTRAINT `ScoreFreeMockTest_participant_id_fkey` FOREIGN KEY (`participant_id`) REFERENCES `PlacementTestParticipant`(`participant_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScoreFreeMockTest` ADD CONSTRAINT `ScoreFreeMockTest_mockTestParticipantParticipant_id_fkey` FOREIGN KEY (`mockTestParticipantParticipant_id`) REFERENCES `MockTestParticipant`(`participant_id`) ON DELETE SET NULL ON UPDATE CASCADE;
