/*
  Warnings:

  - Added the required column `program_name` to the `TermsAgreement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `TermsAgreement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `TermsAgreement` ADD COLUMN `program_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `username` VARCHAR(191) NOT NULL;
