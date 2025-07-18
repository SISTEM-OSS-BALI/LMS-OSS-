/*
  Warnings:

  - You are about to drop the column `userGroupUser_group_id` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `User_userGroupUser_group_id_fkey` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `userGroupUser_group_id`;
