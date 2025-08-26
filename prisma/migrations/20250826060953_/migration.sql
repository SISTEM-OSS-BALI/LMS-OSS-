-- DropForeignKey
ALTER TABLE `MaterialProgress` DROP FOREIGN KEY `MaterialProgress_base_id_fkey`;

-- DropForeignKey
ALTER TABLE `MaterialProgress` DROP FOREIGN KEY `MaterialProgress_material_id_fkey`;

-- AddForeignKey
ALTER TABLE `MaterialProgress` ADD CONSTRAINT `MaterialProgress_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `Material`(`material_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialProgress` ADD CONSTRAINT `MaterialProgress_base_id_fkey` FOREIGN KEY (`base_id`) REFERENCES `MaterialAssigmentBase`(`base_id`) ON DELETE CASCADE ON UPDATE CASCADE;
