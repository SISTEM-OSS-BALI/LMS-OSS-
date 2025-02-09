/*
  Warnings:

  - Added the required column `no_phone` to the `Consultant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Consultant` ADD COLUMN `no_phone` VARCHAR(191) NOT NULL;
