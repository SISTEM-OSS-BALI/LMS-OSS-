-- DropForeignKey
ALTER TABLE `TeacherAbsence` DROP FOREIGN KEY `TeacherAbsence_meeting_id_fkey`;

-- AddForeignKey
ALTER TABLE `TeacherAbsence` ADD CONSTRAINT `TeacherAbsence_meeting_id_fkey` FOREIGN KEY (`meeting_id`) REFERENCES `Meeting`(`meeting_id`) ON DELETE CASCADE ON UPDATE CASCADE;
