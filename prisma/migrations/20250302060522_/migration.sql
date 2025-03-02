/*
  Warnings:

  - Added the required column `email` to the `TermsAgreement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `TermsAgreement` ADD COLUMN `email` VARCHAR(191) NOT NULL;
