-- CreateTable
CREATE TABLE `TermsAgreement` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `is_agreed` BOOLEAN NOT NULL DEFAULT false,
    `agreed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `signature_url` LONGTEXT NULL,

    UNIQUE INDEX `TermsAgreement_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TermsAgreement` ADD CONSTRAINT `TermsAgreement_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
