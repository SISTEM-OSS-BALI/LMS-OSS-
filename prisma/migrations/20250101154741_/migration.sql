-- CreateTable
CREATE TABLE `User` (
    `user_id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `no_phone` VARCHAR(191) NULL,
    `role` ENUM('STUDENT', 'TEACHER', 'ADMIN') NOT NULL DEFAULT 'STUDENT',

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScheduleTeacher` (
    `schedule_id` VARCHAR(191) NOT NULL,
    `teacher_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`schedule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScheduleDay` (
    `day_id` VARCHAR(191) NOT NULL,
    `schedule_id` VARCHAR(191) NOT NULL,
    `day` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`day_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScheduleTime` (
    `time_id` VARCHAR(191) NOT NULL,
    `day_id` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,

    PRIMARY KEY (`time_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Meeting` (
    `meeting_id` VARCHAR(191) NOT NULL,
    `method` ENUM('ONLINE', 'OFFLINE') NULL,
    `meetLink` VARCHAR(191) NULL,
    `teacher_id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `dateTime` DATETIME(3) NOT NULL,

    PRIMARY KEY (`meeting_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Course` (
    `course_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `teacher_id` VARCHAR(191) NOT NULL,
    `code_course` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Course_code_course_key`(`code_course`),
    PRIMARY KEY (`course_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CourseEnrollment` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `course_id` VARCHAR(191) NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `enrolledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CourseEnrollment_user_id_course_id_key`(`user_id`, `course_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaterialAssigmentBase` (
    `base_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `course_id` VARCHAR(191) NOT NULL,
    `type` ENUM('ASSIGNMENT', 'MATERIAL') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`base_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Material` (
    `material_id` VARCHAR(191) NOT NULL,
    `base_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`material_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaterialImage` (
    `image_id` VARCHAR(191) NOT NULL,
    `material_id` VARCHAR(191) NOT NULL,
    `imageUrl` LONGTEXT NOT NULL,
    `index` INTEGER NULL,

    PRIMARY KEY (`image_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaterialUrl` (
    `url_id` VARCHAR(191) NOT NULL,
    `material_id` VARCHAR(191) NOT NULL,
    `contentUrl` VARCHAR(191) NULL,
    `index` INTEGER NULL,

    PRIMARY KEY (`url_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaterialText` (
    `text_id` VARCHAR(191) NOT NULL,
    `material_id` VARCHAR(191) NOT NULL,
    `contentText` LONGTEXT NULL,
    `index` INTEGER NULL,

    PRIMARY KEY (`text_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CourseProgress` (
    `progress_course_id` VARCHAR(191) NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `progress` DOUBLE NOT NULL DEFAULT 0,
    `totalMaterialAssigement` INTEGER NOT NULL DEFAULT 0,
    `user_id` VARCHAR(191) NOT NULL,
    `currentMaterialAssigmentBaseId` VARCHAR(191) NULL,
    `course_id` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CourseProgress_user_id_course_id_key`(`user_id`, `course_id`),
    PRIMARY KEY (`progress_course_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaterialProgress` (
    `progress_id` VARCHAR(191) NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `user_id` VARCHAR(191) NOT NULL,
    `material_id` VARCHAR(191) NOT NULL,
    `base_id` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `MaterialProgress_user_id_material_id_key`(`user_id`, `material_id`),
    PRIMARY KEY (`progress_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AssignmentProgress` (
    `progress_id` VARCHAR(191) NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `score` INTEGER NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `base_id` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `assignment_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `AssignmentProgress_user_id_base_id_key`(`user_id`, `base_id`),
    PRIMARY KEY (`progress_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assignment` (
    `assignment_id` VARCHAR(191) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `timeLimit` INTEGER NOT NULL,
    `base_id` VARCHAR(191) NOT NULL,
    `type` ENUM('MULTIPLE_CHOICE', 'ESSAY', 'PAIR') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`assignment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MultipleChoice` (
    `mcq_id` VARCHAR(191) NOT NULL,
    `question` LONGTEXT NOT NULL,
    `options` JSON NOT NULL,
    `correctAnswer` VARCHAR(191) NOT NULL,
    `assignment_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`mcq_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Essay` (
    `essay_id` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `assignment_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Essay_assignment_id_key`(`assignment_id`),
    PRIMARY KEY (`essay_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SentenceMatching` (
    `matching_id` VARCHAR(191) NOT NULL,
    `assignment_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `SentenceMatching_assignment_id_key`(`assignment_id`),
    PRIMARY KEY (`matching_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pair` (
    `pair_id` VARCHAR(191) NOT NULL,
    `matching_id` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `correctAnswer` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`pair_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentAnswerAssigment` (
    `answer_id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `assignment_id` VARCHAR(191) NOT NULL,
    `mcq_id` VARCHAR(191) NULL,
    `essay_id` VARCHAR(191) NULL,
    `pair_id` VARCHAR(191) NULL,
    `studentAnswer` LONGTEXT NOT NULL,
    `isCorrect` BOOLEAN NULL,
    `score` INTEGER NOT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`answer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ScheduleTeacher` ADD CONSTRAINT `ScheduleTeacher_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScheduleDay` ADD CONSTRAINT `ScheduleDay_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `ScheduleTeacher`(`schedule_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScheduleTime` ADD CONSTRAINT `ScheduleTime_day_id_fkey` FOREIGN KEY (`day_id`) REFERENCES `ScheduleDay`(`day_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meeting` ADD CONSTRAINT `Meeting_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meeting` ADD CONSTRAINT `Meeting_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseEnrollment` ADD CONSTRAINT `CourseEnrollment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseEnrollment` ADD CONSTRAINT `CourseEnrollment_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `Course`(`course_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialAssigmentBase` ADD CONSTRAINT `MaterialAssigmentBase_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `Course`(`course_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Material` ADD CONSTRAINT `Material_base_id_fkey` FOREIGN KEY (`base_id`) REFERENCES `MaterialAssigmentBase`(`base_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialImage` ADD CONSTRAINT `MaterialImage_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `Material`(`material_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialUrl` ADD CONSTRAINT `MaterialUrl_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `Material`(`material_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialText` ADD CONSTRAINT `MaterialText_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `Material`(`material_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseProgress` ADD CONSTRAINT `CourseProgress_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseProgress` ADD CONSTRAINT `CourseProgress_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `Course`(`course_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialProgress` ADD CONSTRAINT `MaterialProgress_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialProgress` ADD CONSTRAINT `MaterialProgress_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `Material`(`material_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialProgress` ADD CONSTRAINT `MaterialProgress_base_id_fkey` FOREIGN KEY (`base_id`) REFERENCES `MaterialAssigmentBase`(`base_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssignmentProgress` ADD CONSTRAINT `AssignmentProgress_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssignmentProgress` ADD CONSTRAINT `AssignmentProgress_base_id_fkey` FOREIGN KEY (`base_id`) REFERENCES `MaterialAssigmentBase`(`base_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssignmentProgress` ADD CONSTRAINT `AssignmentProgress_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `Assignment`(`assignment_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assignment` ADD CONSTRAINT `Assignment_base_id_fkey` FOREIGN KEY (`base_id`) REFERENCES `MaterialAssigmentBase`(`base_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MultipleChoice` ADD CONSTRAINT `MultipleChoice_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `Assignment`(`assignment_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Essay` ADD CONSTRAINT `Essay_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `Assignment`(`assignment_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SentenceMatching` ADD CONSTRAINT `SentenceMatching_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `Assignment`(`assignment_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pair` ADD CONSTRAINT `Pair_matching_id_fkey` FOREIGN KEY (`matching_id`) REFERENCES `SentenceMatching`(`matching_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerAssigment` ADD CONSTRAINT `StudentAnswerAssigment_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerAssigment` ADD CONSTRAINT `StudentAnswerAssigment_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `Assignment`(`assignment_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerAssigment` ADD CONSTRAINT `StudentAnswerAssigment_mcq_id_fkey` FOREIGN KEY (`mcq_id`) REFERENCES `MultipleChoice`(`mcq_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerAssigment` ADD CONSTRAINT `StudentAnswerAssigment_essay_id_fkey` FOREIGN KEY (`essay_id`) REFERENCES `Essay`(`essay_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAnswerAssigment` ADD CONSTRAINT `StudentAnswerAssigment_pair_id_fkey` FOREIGN KEY (`pair_id`) REFERENCES `Pair`(`pair_id`) ON DELETE SET NULL ON UPDATE CASCADE;
