/*
  Warnings:

  - You are about to drop the column `new_end_date` on the `UserProgramRenewal` table. All the data in the column will be lost.
  - You are about to drop the column `new_start_date` on the `UserProgramRenewal` table. All the data in the column will be lost.
  - You are about to drop the column `old_end_date` on the `UserProgramRenewal` table. All the data in the column will be lost.
  - You are about to drop the column `old_start_date` on the `UserProgramRenewal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `UserProgramRenewal` DROP COLUMN `new_end_date`,
    DROP COLUMN `new_start_date`,
    DROP COLUMN `old_end_date`,
    DROP COLUMN `old_start_date`;
