-- CreateTable
CREATE TABLE `PlacementTestSession` (
    `session_id` VARCHAR(191) NOT NULL,
    `placement_test_id` VARCHAR(191) NOT NULL,
    `sessionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`session_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlacementTestParticipant` (
    `participant_id` VARCHAR(191) NOT NULL,
    `session_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `institution` VARCHAR(191) NOT NULL,
    `grade` VARCHAR(191) NOT NULL,
    `social_media` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PlacementTestParticipant_email_key`(`email`),
    PRIMARY KEY (`participant_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PlacementTestSession` ADD CONSTRAINT `PlacementTestSession_placement_test_id_fkey` FOREIGN KEY (`placement_test_id`) REFERENCES `PlacementTest`(`placement_test_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlacementTestParticipant` ADD CONSTRAINT `PlacementTestParticipant_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `PlacementTestSession`(`session_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
