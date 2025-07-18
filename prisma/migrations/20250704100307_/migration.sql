/*
  Warnings:

  - You are about to drop the column `abilityScale` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `progress_student` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `studentPerformance` on the `Meeting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Meeting` DROP COLUMN `abilityScale`,
    DROP COLUMN `progress_student`,
    DROP COLUMN `studentPerformance`;
