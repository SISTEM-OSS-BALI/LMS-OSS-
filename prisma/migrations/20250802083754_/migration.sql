/*
  Warnings:

  - You are about to drop the column `absent` on the `Meeting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Meeting` DROP COLUMN `absent`,
    ADD COLUMN `finished_time` DATETIME(3) NULL,
    ADD COLUMN `is_started` BOOLEAN NULL,
    ADD COLUMN `started_time` DATETIME(3) NULL;
