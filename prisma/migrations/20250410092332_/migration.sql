-- DropForeignKey
ALTER TABLE `ScoreMockTest` DROP FOREIGN KEY `ScoreMockTest_student_id_fkey`;

-- DropForeignKey
ALTER TABLE `ScorePlacementTest` DROP FOREIGN KEY `ScorePlacementTest_student_id_fkey`;

-- DropForeignKey
ALTER TABLE `StudentAnswerAssigment` DROP FOREIGN KEY `StudentAnswerAssigment_student_id_fkey`;

-- DropForeignKey
ALTER TABLE `StudentAnswerMockTest` DROP FOREIGN KEY `StudentAnswerMockTest_student_id_fkey`;

-- DropForeignKey
ALTER TABLE `StudentAnswerPlacementTest` DROP FOREIGN KEY `StudentAnswerPlacementTest_student_id_fkey`;

-- AddForeignKey
ALTER TABLE `StudentAnswerAssigment` ADD CONSTRAINT `StudentAnswerAssigment_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerPlacementTest` ADD CONSTRAINT `StudentAnswerPlacementTest_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScorePlacementTest` ADD CONSTRAINT `ScorePlacementTest_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScoreMockTest` ADD CONSTRAINT `ScoreMockTest_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerMockTest` ADD CONSTRAINT `StudentAnswerMockTest_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
