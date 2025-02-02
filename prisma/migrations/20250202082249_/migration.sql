/*
  Warnings:

  - You are about to drop the `StudentAnswerAssigmentPlacementTest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `StudentAnswerAssigmentPlacementTest` DROP FOREIGN KEY `StudentAnswerAssigmentPlacementTest_assignment_id_fkey`;

-- DropForeignKey
ALTER TABLE `StudentAnswerAssigmentPlacementTest` DROP FOREIGN KEY `StudentAnswerAssigmentPlacementTest_mcq_id_fkey`;

-- DropForeignKey
ALTER TABLE `StudentAnswerAssigmentPlacementTest` DROP FOREIGN KEY `StudentAnswerAssigmentPlacementTest_student_id_fkey`;

-- DropTable
DROP TABLE `StudentAnswerAssigmentPlacementTest`;

-- CreateTable
CREATE TABLE `StudentAnswerPlacementTest` (
    `answer_id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `assignment_id` VARCHAR(191) NOT NULL,
    `mcq_id` VARCHAR(191) NULL,
    `studentAnswer` LONGTEXT NOT NULL,
    `isCorrect` BOOLEAN NULL,
    `score` INTEGER NOT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`answer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StudentAnswerPlacementTest` ADD CONSTRAINT `StudentAnswerPlacementTest_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerPlacementTest` ADD CONSTRAINT `StudentAnswerPlacementTest_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `Assignment`(`assignment_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerPlacementTest` ADD CONSTRAINT `StudentAnswerPlacementTest_mcq_id_fkey` FOREIGN KEY (`mcq_id`) REFERENCES `MultipleChoicePlacementTest`(`mcq_id`) ON DELETE SET NULL ON UPDATE CASCADE;
