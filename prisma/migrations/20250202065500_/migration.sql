-- CreateTable
CREATE TABLE `AccessPlacementTest` (
    `access_placement_test_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `placement_test_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`access_placement_test_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AccessPlacementTest` ADD CONSTRAINT `AccessPlacementTest_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessPlacementTest` ADD CONSTRAINT `AccessPlacementTest_placement_test_id_fkey` FOREIGN KEY (`placement_test_id`) REFERENCES `PlacementTest`(`placement_test_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
