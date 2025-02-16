-- AlterTable
ALTER TABLE `Testimoni` MODIFY `class_experience` LONGTEXT NOT NULL,
    MODIFY `favorite_part` LONGTEXT NOT NULL,
    MODIFY `improvement_suggestions` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `target` LONGTEXT NULL;
