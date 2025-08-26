-- CreateTable
CREATE TABLE `MaterialPdf` (
    `pdf_id` VARCHAR(191) NOT NULL,
    `material_id` VARCHAR(191) NOT NULL,
    `pdfUrl` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`pdf_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MaterialPdf` ADD CONSTRAINT `MaterialPdf_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `Material`(`material_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
