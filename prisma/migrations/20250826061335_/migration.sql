-- DropForeignKey
ALTER TABLE `Assignment` DROP FOREIGN KEY `Assignment_base_id_fkey`;

-- AddForeignKey
ALTER TABLE `Assignment` ADD CONSTRAINT `Assignment_base_id_fkey` FOREIGN KEY (`base_id`) REFERENCES `MaterialAssigmentBase`(`base_id`) ON DELETE CASCADE ON UPDATE CASCADE;
