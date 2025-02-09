/*
  Warnings:

  - You are about to drop the column `assignmentAssignment_id` on the `StudentAnswerPlacementTest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `StudentAnswerPlacementTest` DROP FOREIGN KEY `StudentAnswerPlacementTest_assignmentAssignment_id_fkey`;

-- AlterTable
ALTER TABLE `StudentAnswerPlacementTest` DROP COLUMN `assignmentAssignment_id`;
