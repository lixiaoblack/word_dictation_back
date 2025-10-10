-- 为dictation_words表添加中文释义语音字段
-- 执行时间: 2025年10月9日
-- 作用: 为听写单词记录添加中文释义语音文件URL存储字段

-- 添加中文语音字段
ALTER TABLE `dictation_words` 
ADD COLUMN `chinese_audio_url` VARCHAR(500) NULL COMMENT '中文释义语音文件URL' 
AFTER `notes`;

-- 添加索引以优化查询性能（可选）
-- CREATE INDEX `IDX_dictation_word_chinese_audio` ON `dictation_words` (`chinese_audio_url`);

-- 验证修改
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'dictation_words' 
  AND COLUMN_NAME = 'chinese_audio_url';