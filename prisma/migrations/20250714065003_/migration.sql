-- CreateTable
CREATE TABLE `UserProgramRenewal` (
    `renewal_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `old_program_id` VARCHAR(191) NULL,
    `new_program_id` VARCHAR(191) NULL,
    `renew_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `old_start_date` DATETIME(3) NULL,
    `old_end_date` DATETIME(3) NULL,
    `new_start_date` DATETIME(3) NULL,
    `new_end_date` DATETIME(3) NULL,

    PRIMARY KEY (`renewal_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserProgramRenewal` ADD CONSTRAINT `UserProgramRenewal_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
