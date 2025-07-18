/*
  Warnings:

  - You are about to drop the column `name` on the `UserGroup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `username` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `UserGroup` DROP COLUMN `name`;
