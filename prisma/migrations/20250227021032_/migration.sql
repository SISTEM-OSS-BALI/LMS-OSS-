-- CreateTable
CREATE TABLE `MockTest` (
    `mock_test_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`mock_test_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BaseMockTest` (
    `base_mock_test_id` VARCHAR(191) NOT NULL,
    `mock_test_id` VARCHAR(191) NOT NULL,
    `type` ENUM('READING', 'LISTENING', 'SPEAKING', 'WRITING') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`base_mock_test_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reading` (
    `reading_id` VARCHAR(191) NOT NULL,
    `base_mock_test_id` VARCHAR(191) NOT NULL,
    `passage` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Reading_base_mock_test_id_key`(`base_mock_test_id`),
    PRIMARY KEY (`reading_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReadingQuestion` (
    `question_id` VARCHAR(191) NOT NULL,
    `reading_id` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `options` JSON NULL,
    `answer` VARCHAR(191) NULL,

    PRIMARY KEY (`question_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Listening` (
    `listening_id` VARCHAR(191) NOT NULL,
    `base_mock_test_id` VARCHAR(191) NOT NULL,
    `audio_url` VARCHAR(191) NOT NULL,
    `transcript` VARCHAR(191) NULL,

    UNIQUE INDEX `Listening_base_mock_test_id_key`(`base_mock_test_id`),
    PRIMARY KEY (`listening_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ListeningQuestion` (
    `question_id` VARCHAR(191) NOT NULL,
    `listening_id` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `options` JSON NULL,
    `answer` VARCHAR(191) NULL,

    PRIMARY KEY (`question_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Speaking` (
    `speaking_id` VARCHAR(191) NOT NULL,
    `base_mock_test_id` VARCHAR(191) NOT NULL,
    `prompt` VARCHAR(191) NOT NULL,
    `recording_url` VARCHAR(191) NULL,

    UNIQUE INDEX `Speaking_base_mock_test_id_key`(`base_mock_test_id`),
    PRIMARY KEY (`speaking_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Writing` (
    `writing_id` VARCHAR(191) NOT NULL,
    `base_mock_test_id` VARCHAR(191) NOT NULL,
    `prompt` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Writing_base_mock_test_id_key`(`base_mock_test_id`),
    PRIMARY KEY (`writing_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WritingQuestion` (
    `question_id` VARCHAR(191) NOT NULL,
    `writing_id` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `sample_answer` VARCHAR(191) NULL,

    PRIMARY KEY (`question_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BaseMockTest` ADD CONSTRAINT `BaseMockTest_mock_test_id_fkey` FOREIGN KEY (`mock_test_id`) REFERENCES `MockTest`(`mock_test_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reading` ADD CONSTRAINT `Reading_base_mock_test_id_fkey` FOREIGN KEY (`base_mock_test_id`) REFERENCES `BaseMockTest`(`base_mock_test_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReadingQuestion` ADD CONSTRAINT `ReadingQuestion_reading_id_fkey` FOREIGN KEY (`reading_id`) REFERENCES `Reading`(`reading_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Listening` ADD CONSTRAINT `Listening_base_mock_test_id_fkey` FOREIGN KEY (`base_mock_test_id`) REFERENCES `BaseMockTest`(`base_mock_test_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListeningQuestion` ADD CONSTRAINT `ListeningQuestion_listening_id_fkey` FOREIGN KEY (`listening_id`) REFERENCES `Listening`(`listening_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Speaking` ADD CONSTRAINT `Speaking_base_mock_test_id_fkey` FOREIGN KEY (`base_mock_test_id`) REFERENCES `BaseMockTest`(`base_mock_test_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Writing` ADD CONSTRAINT `Writing_base_mock_test_id_fkey` FOREIGN KEY (`base_mock_test_id`) REFERENCES `BaseMockTest`(`base_mock_test_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WritingQuestion` ADD CONSTRAINT `WritingQuestion_writing_id_fkey` FOREIGN KEY (`writing_id`) REFERENCES `Writing`(`writing_id`) ON DELETE CASCADE ON UPDATE CASCADE;
