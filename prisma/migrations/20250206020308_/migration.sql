/*
  Warnings:

  - You are about to drop the column `assignment_id` on the `StudentAnswerPlacementTest` table. All the data in the column will be lost.
  - Added the required column `placement_test_id` to the `StudentAnswerPlacementTest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `StudentAnswerPlacementTest` DROP FOREIGN KEY `StudentAnswerPlacementTest_assignment_id_fkey`;

-- AlterTable
ALTER TABLE `StudentAnswerPlacementTest` DROP COLUMN `assignment_id`,
    ADD COLUMN `assignmentAssignment_id` VARCHAR(191) NULL,
    ADD COLUMN `placement_test_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `StudentAnswerPlacementTest` ADD CONSTRAINT `StudentAnswerPlacementTest_placement_test_id_fkey` FOREIGN KEY (`placement_test_id`) REFERENCES `PlacementTest`(`placement_test_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerPlacementTest` ADD CONSTRAINT `StudentAnswerPlacementTest_assignmentAssignment_id_fkey` FOREIGN KEY (`assignmentAssignment_id`) REFERENCES `Assignment`(`assignment_id`) ON DELETE SET NULL ON UPDATE CASCADE;
