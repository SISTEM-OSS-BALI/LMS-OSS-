-- DropForeignKey
ALTER TABLE `AssignmentProgress` DROP FOREIGN KEY `AssignmentProgress_assignment_id_fkey`;

-- DropForeignKey
ALTER TABLE `AssignmentProgress` DROP FOREIGN KEY `AssignmentProgress_base_id_fkey`;

-- AddForeignKey
ALTER TABLE `AssignmentProgress` ADD CONSTRAINT `AssignmentProgress_base_id_fkey` FOREIGN KEY (`base_id`) REFERENCES `MaterialAssigmentBase`(`base_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssignmentProgress` ADD CONSTRAINT `AssignmentProgress_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `Assignment`(`assignment_id`) ON DELETE CASCADE ON UPDATE CASCADE;
