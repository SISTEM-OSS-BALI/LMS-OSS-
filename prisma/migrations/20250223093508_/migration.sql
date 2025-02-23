-- DropForeignKey
ALTER TABLE `BasePlacementTest` DROP FOREIGN KEY `BasePlacementTest_placementTestId_fkey`;

-- DropForeignKey
ALTER TABLE `MultipleChoicePlacementTest` DROP FOREIGN KEY `MultipleChoicePlacementTest_basePlacementTestId_fkey`;

-- DropForeignKey
ALTER TABLE `TrueFalseGroupPlacementTest` DROP FOREIGN KEY `TrueFalseGroupPlacementTest_basePlacementTestId_fkey`;

-- DropForeignKey
ALTER TABLE `TrueFalseQuestion` DROP FOREIGN KEY `TrueFalseQuestion_group_id_fkey`;

-- DropForeignKey
ALTER TABLE `WritingPlacementTest` DROP FOREIGN KEY `WritingPlacementTest_basePlacementTestId_fkey`;

-- AddForeignKey
ALTER TABLE `BasePlacementTest` ADD CONSTRAINT `BasePlacementTest_placementTestId_fkey` FOREIGN KEY (`placementTestId`) REFERENCES `PlacementTest`(`placement_test_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MultipleChoicePlacementTest` ADD CONSTRAINT `MultipleChoicePlacementTest_basePlacementTestId_fkey` FOREIGN KEY (`basePlacementTestId`) REFERENCES `BasePlacementTest`(`base_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrueFalseGroupPlacementTest` ADD CONSTRAINT `TrueFalseGroupPlacementTest_basePlacementTestId_fkey` FOREIGN KEY (`basePlacementTestId`) REFERENCES `BasePlacementTest`(`base_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrueFalseQuestion` ADD CONSTRAINT `TrueFalseQuestion_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `TrueFalseGroupPlacementTest`(`group_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WritingPlacementTest` ADD CONSTRAINT `WritingPlacementTest_basePlacementTestId_fkey` FOREIGN KEY (`basePlacementTestId`) REFERENCES `BasePlacementTest`(`base_id`) ON DELETE CASCADE ON UPDATE CASCADE;
