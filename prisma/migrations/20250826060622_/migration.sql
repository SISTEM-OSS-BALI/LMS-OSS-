-- DropForeignKey
ALTER TABLE `Material` DROP FOREIGN KEY `Material_base_id_fkey`;

-- DropForeignKey
ALTER TABLE `MaterialImage` DROP FOREIGN KEY `MaterialImage_material_id_fkey`;

-- DropForeignKey
ALTER TABLE `MaterialPdf` DROP FOREIGN KEY `MaterialPdf_material_id_fkey`;

-- DropForeignKey
ALTER TABLE `MaterialText` DROP FOREIGN KEY `MaterialText_material_id_fkey`;

-- DropForeignKey
ALTER TABLE `MaterialUrl` DROP FOREIGN KEY `MaterialUrl_material_id_fkey`;

-- AddForeignKey
ALTER TABLE `Material` ADD CONSTRAINT `Material_base_id_fkey` FOREIGN KEY (`base_id`) REFERENCES `MaterialAssigmentBase`(`base_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialImage` ADD CONSTRAINT `MaterialImage_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `Material`(`material_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialUrl` ADD CONSTRAINT `MaterialUrl_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `Material`(`material_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialText` ADD CONSTRAINT `MaterialText_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `Material`(`material_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialPdf` ADD CONSTRAINT `MaterialPdf_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `Material`(`material_id`) ON DELETE CASCADE ON UPDATE CASCADE;
