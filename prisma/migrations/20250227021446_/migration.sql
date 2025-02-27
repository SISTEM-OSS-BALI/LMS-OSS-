/*
  Warnings:

  - You are about to drop the `Listening` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reading` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Speaking` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Listening` DROP FOREIGN KEY `Listening_base_mock_test_id_fkey`;

-- DropForeignKey
ALTER TABLE `ListeningQuestion` DROP FOREIGN KEY `ListeningQuestion_listening_id_fkey`;

-- DropForeignKey
ALTER TABLE `Reading` DROP FOREIGN KEY `Reading_base_mock_test_id_fkey`;

-- DropForeignKey
ALTER TABLE `ReadingQuestion` DROP FOREIGN KEY `ReadingQuestion_reading_id_fkey`;

-- DropForeignKey
ALTER TABLE `Speaking` DROP FOREIGN KEY `Speaking_base_mock_test_id_fkey`;

-- DropTable
DROP TABLE `Listening`;

-- DropTable
DROP TABLE `Reading`;

-- DropTable
DROP TABLE `Speaking`;

-- CreateTable
CREATE TABLE `ReadingMockTest` (
    `reading_id` VARCHAR(191) NOT NULL,
    `base_mock_test_id` VARCHAR(191) NOT NULL,
    `passage` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ReadingMockTest_base_mock_test_id_key`(`base_mock_test_id`),
    PRIMARY KEY (`reading_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ListeningMockTest` (
    `listening_id` VARCHAR(191) NOT NULL,
    `base_mock_test_id` VARCHAR(191) NOT NULL,
    `audio_url` VARCHAR(191) NOT NULL,
    `transcript` VARCHAR(191) NULL,

    UNIQUE INDEX `ListeningMockTest_base_mock_test_id_key`(`base_mock_test_id`),
    PRIMARY KEY (`listening_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SpeakingMockTest` (
    `speaking_id` VARCHAR(191) NOT NULL,
    `base_mock_test_id` VARCHAR(191) NOT NULL,
    `prompt` VARCHAR(191) NOT NULL,
    `recording_url` VARCHAR(191) NULL,

    UNIQUE INDEX `SpeakingMockTest_base_mock_test_id_key`(`base_mock_test_id`),
    PRIMARY KEY (`speaking_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ReadingMockTest` ADD CONSTRAINT `ReadingMockTest_base_mock_test_id_fkey` FOREIGN KEY (`base_mock_test_id`) REFERENCES `BaseMockTest`(`base_mock_test_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReadingQuestion` ADD CONSTRAINT `ReadingQuestion_reading_id_fkey` FOREIGN KEY (`reading_id`) REFERENCES `ReadingMockTest`(`reading_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListeningMockTest` ADD CONSTRAINT `ListeningMockTest_base_mock_test_id_fkey` FOREIGN KEY (`base_mock_test_id`) REFERENCES `BaseMockTest`(`base_mock_test_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListeningQuestion` ADD CONSTRAINT `ListeningQuestion_listening_id_fkey` FOREIGN KEY (`listening_id`) REFERENCES `ListeningMockTest`(`listening_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SpeakingMockTest` ADD CONSTRAINT `SpeakingMockTest_base_mock_test_id_fkey` FOREIGN KEY (`base_mock_test_id`) REFERENCES `BaseMockTest`(`base_mock_test_id`) ON DELETE CASCADE ON UPDATE CASCADE;
