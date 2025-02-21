/*
  Warnings:

  - You are about to drop the column `title` on the `TrueFalseGroupPlacementTest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `TrueFalseGroupPlacementTest` DROP COLUMN `title`;

-- AlterTable
ALTER TABLE `WritingPlacementTest` ADD COLUMN `marks` INTEGER NULL;
