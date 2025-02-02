-- CreateTable
CREATE TABLE `TeacherAbsence` (
    `teacher_absence_id` VARCHAR(191) NOT NULL,
    `teacher_id` VARCHAR(191) NOT NULL,
    `meeting_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`teacher_absence_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TeacherAbsence` ADD CONSTRAINT `TeacherAbsence_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherAbsence` ADD CONSTRAINT `TeacherAbsence_meeting_id_fkey` FOREIGN KEY (`meeting_id`) REFERENCES `Meeting`(`meeting_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
