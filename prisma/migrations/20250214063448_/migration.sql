/*
  Warnings:

  - The primary key for the `Testimoni` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `testimoni` on the `Testimoni` table. All the data in the column will be lost.
  - You are about to drop the column `testimoni_id` on the `Testimoni` table. All the data in the column will be lost.
  - Added the required column `class_experience` to the `Testimoni` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exercise_and_assignment_relevance` to the `Testimoni` table without a default value. This is not possible if the table is not empty.
  - Added the required column `favorite_part` to the `Testimoni` table without a default value. This is not possible if the table is not empty.
  - Added the required column `improvement_suggestions` to the `Testimoni` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lesson_satisfaction` to the `Testimoni` table without a default value. This is not possible if the table is not empty.
  - Added the required column `material_relevance` to the `Testimoni` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacher_attention` to the `Testimoni` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacher_ethics` to the `Testimoni` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacher_identity` to the `Testimoni` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacher_motivation` to the `Testimoni` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teaching_delivery` to the `Testimoni` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teaching_method_effectiveness` to the `Testimoni` table without a default value. This is not possible if the table is not empty.
  - The required column `testimonial_id` was added to the `Testimoni` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE `Testimoni` DROP PRIMARY KEY,
    DROP COLUMN `testimoni`,
    DROP COLUMN `testimoni_id`,
    ADD COLUMN `class_experience` VARCHAR(191) NOT NULL,
    ADD COLUMN `exercise_and_assignment_relevance` INTEGER NOT NULL,
    ADD COLUMN `favorite_part` VARCHAR(191) NOT NULL,
    ADD COLUMN `improvement_suggestions` VARCHAR(191) NOT NULL,
    ADD COLUMN `lesson_satisfaction` INTEGER NOT NULL,
    ADD COLUMN `material_relevance` INTEGER NOT NULL,
    ADD COLUMN `teacher_attention` INTEGER NOT NULL,
    ADD COLUMN `teacher_ethics` INTEGER NOT NULL,
    ADD COLUMN `teacher_identity` VARCHAR(191) NOT NULL,
    ADD COLUMN `teacher_motivation` INTEGER NOT NULL,
    ADD COLUMN `teaching_delivery` INTEGER NOT NULL,
    ADD COLUMN `teaching_method_effectiveness` INTEGER NOT NULL,
    ADD COLUMN `testimonial_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`testimonial_id`);
