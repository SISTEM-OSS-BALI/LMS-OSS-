/*
  Warnings:

  - Added the required column `name` to the `PlacementTest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PlacementTest` ADD COLUMN `name` VARCHAR(191) NOT NULL;
