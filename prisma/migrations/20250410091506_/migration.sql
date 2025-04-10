-- DropForeignKey
ALTER TABLE `Section` DROP FOREIGN KEY `Section_certificate_id_fkey`;

-- AddForeignKey
ALTER TABLE `Section` ADD CONSTRAINT `Section_certificate_id_fkey` FOREIGN KEY (`certificate_id`) REFERENCES `Certificate`(`certificate_id`) ON DELETE CASCADE ON UPDATE CASCADE;
