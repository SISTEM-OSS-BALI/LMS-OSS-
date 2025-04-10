-- DropForeignKey
ALTER TABLE `AccessCourse` DROP FOREIGN KEY `AccessCourse_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `AccessMockTest` DROP FOREIGN KEY `AccessMockTest_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `AccessPlacementTest` DROP FOREIGN KEY `AccessPlacementTest_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `AssignmentProgress` DROP FOREIGN KEY `AssignmentProgress_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `CourseProgress` DROP FOREIGN KEY `CourseProgress_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `MaterialProgress` DROP FOREIGN KEY `MaterialProgress_user_id_fkey`;

-- AddForeignKey
ALTER TABLE `AccessCourse` ADD CONSTRAINT `AccessCourse_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseProgress` ADD CONSTRAINT `CourseProgress_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialProgress` ADD CONSTRAINT `MaterialProgress_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssignmentProgress` ADD CONSTRAINT `AssignmentProgress_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessPlacementTest` ADD CONSTRAINT `AccessPlacementTest_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessMockTest` ADD CONSTRAINT `AccessMockTest_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
