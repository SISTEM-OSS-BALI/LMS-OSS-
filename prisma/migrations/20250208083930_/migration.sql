-- AlterTable
ALTER TABLE `User` ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `is_active` BOOLEAN NULL DEFAULT true,
    ADD COLUMN `startDate` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `RescheduleMeeting` (
    `reschedule_meeting_id` VARCHAR(191) NOT NULL,
    `teacher_id` VARCHAR(191) NOT NULL,
    `meeting_id` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `option_reason` VARCHAR(191) NOT NULL,
    `imageUrl` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` BOOLEAN NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`reschedule_meeting_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RescheduleMeeting` ADD CONSTRAINT `RescheduleMeeting_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RescheduleMeeting` ADD CONSTRAINT `RescheduleMeeting_meeting_id_fkey` FOREIGN KEY (`meeting_id`) REFERENCES `Meeting`(`meeting_id`) ON DELETE CASCADE ON UPDATE CASCADE;
