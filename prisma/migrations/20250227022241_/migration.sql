-- AlterTable
ALTER TABLE `ListeningMockTest` MODIFY `audio_url` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `ListeningQuestion` MODIFY `question` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `ReadingMockTest` MODIFY `passage` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `ReadingQuestion` MODIFY `question` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `SpeakingMockTest` MODIFY `prompt` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `WritingMockTest` MODIFY `prompt` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `WritingQuestion` MODIFY `question` LONGTEXT NOT NULL;
