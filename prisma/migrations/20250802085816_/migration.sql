/*
  Warnings:

  - You are about to drop the column `absent` on the `Meeting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Meeting` DROP COLUMN `absent`,
    ADD COLUMN `alpha` BOOLEAN NULL;
