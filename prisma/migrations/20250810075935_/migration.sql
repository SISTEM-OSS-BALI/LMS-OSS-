/*
  Warnings:

  - You are about to drop the column `allDay` on the `ScheduleBlock` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `ScheduleBlock` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ScheduleBlock` DROP COLUMN `allDay`,
    DROP COLUMN `title`;
