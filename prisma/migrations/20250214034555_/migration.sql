-- CreateTable
CREATE TABLE `Testimoni` (
    `testimoni_id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `testimoni` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`testimoni_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Testimoni` ADD CONSTRAINT `Testimoni_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
