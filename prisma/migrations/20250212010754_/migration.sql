/*
  Warnings:

  - You are about to drop the column `endDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `endDate`,
    DROP COLUMN `startDate`,
    ADD COLUMN `end_date` DATETIME(3) NULL,
    ADD COLUMN `start_date` DATETIME(3) NULL;
