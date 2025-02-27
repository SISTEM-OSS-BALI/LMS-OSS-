/*
  Warnings:

  - You are about to drop the column `sample_answer` on the `WritingQuestion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `WritingQuestion` DROP COLUMN `sample_answer`,
    ADD COLUMN `answer` VARCHAR(191) NULL,
    ADD COLUMN `options` JSON NULL;
