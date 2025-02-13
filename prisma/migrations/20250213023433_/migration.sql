-- CreateTable
CREATE TABLE `Certificate` (
    `certificate_id` VARCHAR(191) NOT NULL,
    `no_certificate` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `is_complated_meeting` BOOLEAN NULL,
    `is_complated_testimoni` BOOLEAN NULL,
    `section` ENUM('READING', 'SPEAKING', 'LISTENING', 'WRITING') NULL,
    `level` VARCHAR(191) NULL,
    `comment` VARCHAR(191) NULL,
    `overall` VARCHAR(191) NULL,

    UNIQUE INDEX `Certificate_no_certificate_key`(`no_certificate`),
    PRIMARY KEY (`certificate_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Certificate` ADD CONSTRAINT `Certificate_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
