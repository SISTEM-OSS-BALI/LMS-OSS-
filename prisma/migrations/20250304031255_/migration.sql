/*
  Warnings:

  - You are about to drop the column `user_id` on the `ScorePlacementTest` table. All the data in the column will be lost.
  - Added the required column `student_id` to the `ScorePlacementTest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ScorePlacementTest` DROP FOREIGN KEY `ScorePlacementTest_user_id_fkey`;

-- AlterTable
ALTER TABLE `ScorePlacementTest` DROP COLUMN `user_id`,
    ADD COLUMN `student_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `ScorePlacementTest` ADD CONSTRAINT `ScorePlacementTest_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
