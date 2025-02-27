/*
  Warnings:

  - You are about to drop the `Writing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Writing` DROP FOREIGN KEY `Writing_base_mock_test_id_fkey`;

-- DropForeignKey
ALTER TABLE `WritingQuestion` DROP FOREIGN KEY `WritingQuestion_writing_id_fkey`;

-- DropTable
DROP TABLE `Writing`;

-- CreateTable
CREATE TABLE `WritingMockTest` (
    `writing_id` VARCHAR(191) NOT NULL,
    `base_mock_test_id` VARCHAR(191) NOT NULL,
    `prompt` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `WritingMockTest_base_mock_test_id_key`(`base_mock_test_id`),
    PRIMARY KEY (`writing_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WritingMockTest` ADD CONSTRAINT `WritingMockTest_base_mock_test_id_fkey` FOREIGN KEY (`base_mock_test_id`) REFERENCES `BaseMockTest`(`base_mock_test_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WritingQuestion` ADD CONSTRAINT `WritingQuestion_writing_id_fkey` FOREIGN KEY (`writing_id`) REFERENCES `WritingMockTest`(`writing_id`) ON DELETE CASCADE ON UPDATE CASCADE;
