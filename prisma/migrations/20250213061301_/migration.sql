-- AlterTable
ALTER TABLE `Certificate` MODIFY `is_complated_meeting` BOOLEAN NULL DEFAULT false,
    MODIFY `is_complated_testimoni` BOOLEAN NULL DEFAULT false,
    MODIFY `is_download` BOOLEAN NULL DEFAULT false;
