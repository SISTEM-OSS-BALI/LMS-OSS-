/*
  Warnings:

  - You are about to drop the column `time_limit` on the `MockTest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `MockTest` DROP COLUMN `time_limit`,
    ADD COLUMN `timeLimit` INTEGER NULL;
