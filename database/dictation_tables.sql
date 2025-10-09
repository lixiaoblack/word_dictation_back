-- =============================================
-- 听写管理系统数据库建表语句
-- Author: wanglx  
-- Date: 2025-09-25
-- Description: 包含听写记录、听写单词和错题本三个表
-- =============================================

-- 1. 听写记录表
CREATE TABLE `dictation_records` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` varchar(36) DEFAULT NULL COMMENT '用户ID',
  `name` varchar(100) NOT NULL COMMENT '听写名称',
  `description` text COMMENT '听写描述',
  `status` enum('created','in_progress','completed','paused') NOT NULL DEFAULT 'created' COMMENT '听写状态',
  `question_type` enum('chinese','english','no_question') NOT NULL DEFAULT 'chinese' COMMENT '听写类型：中文提问、英文提问、无提问',
  `word_time_limit` int NOT NULL DEFAULT '10' COMMENT '单个单词听写时间（秒）',
  `switch_mode` enum('auto','manual') NOT NULL DEFAULT 'auto' COMMENT '切换模式：自动切换、手动切换',
  `input_method` enum('keyboard','photo') NOT NULL DEFAULT 'keyboard' COMMENT '输入方式：键盘输入、拍照识别',
  `total_words` int NOT NULL DEFAULT '0' COMMENT '总单词数量',
  `correct_words` int NOT NULL DEFAULT '0' COMMENT '正确单词数量',
  `wrong_words` int NOT NULL DEFAULT '0' COMMENT '错误单词数量',
  `accuracy_rate` float NOT NULL DEFAULT '0' COMMENT '正确率（百分比）',
  `duration_seconds` int NOT NULL DEFAULT '0' COMMENT '用时（秒）',
  `started_at` timestamp NULL DEFAULT NULL COMMENT '开始时间',
  `completed_at` timestamp NULL DEFAULT NULL COMMENT '完成时间',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `IDX_dictation_user_id` (`user_id`),
  KEY `IDX_dictation_status` (`status`),
  KEY `IDX_dictation_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='听写记录表';

-- 2. 听写单词表
CREATE TABLE `dictation_words` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `dictation_record_id` int NOT NULL COMMENT '听写记录ID',
  `word` varchar(100) NOT NULL COMMENT '单词文本',
  `us_phonetic` varchar(200) DEFAULT NULL COMMENT '美式音标',
  `uk_phonetic` varchar(200) DEFAULT NULL COMMENT '英式音标',
  `sentences` json DEFAULT NULL COMMENT '例句列表',
  `synonyms` json DEFAULT NULL COMMENT '同义词列表',
  `translations` json NOT NULL COMMENT '翻译列表',
  `phrases` json DEFAULT NULL COMMENT '短语列表',
  `related_words` json DEFAULT NULL COMMENT '相关词汇列表',
  `status` enum('pending','correct','wrong','skipped') NOT NULL DEFAULT 'pending' COMMENT '听写状态',
  `user_answer` varchar(100) DEFAULT NULL COMMENT '用户输入的答案',
  `time_spent` int NOT NULL DEFAULT '0' COMMENT '用时（秒）',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '单词在听写中的顺序',
  `notes` text DEFAULT NULL COMMENT '备注信息',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `IDX_dictation_word_record_id` (`dictation_record_id`),
  KEY `IDX_dictation_word_status` (`status`),
  KEY `IDX_dictation_word_word` (`word`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='听写单词表';

-- 3. 错题本表
CREATE TABLE `wrong_words` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` varchar(36) DEFAULT NULL COMMENT '用户ID',
  `dictation_record_id` int NOT NULL COMMENT '原听写记录ID',
  `dictation_word_id` int NOT NULL COMMENT '原听写单词ID',
  `word` varchar(100) NOT NULL COMMENT '单词文本',
  `wrong_answer` varchar(100) DEFAULT NULL COMMENT '用户错误答案',
  `correct_answer` varchar(100) NOT NULL COMMENT '正确答案',
  `word_details` json NOT NULL COMMENT '单词详细信息（快照）',
  `error_count` int NOT NULL DEFAULT '0' COMMENT '错误次数',
  `is_reviewed` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已复习',
  `review_status` enum('pending','reviewing','mastered') NOT NULL DEFAULT 'pending' COMMENT '复习状态：待复习、复习中、已掌握',
  `last_reviewed_at` timestamp NULL DEFAULT NULL COMMENT '最后复习时间',
  `next_review_at` timestamp NULL DEFAULT NULL COMMENT '下次复习时间',
  `error_notes` text DEFAULT NULL COMMENT '错误分析备注',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `IDX_wrong_word_user_id` (`user_id`),
  KEY `IDX_wrong_word_word` (`word`),
  KEY `IDX_wrong_word_review_status` (`review_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='错题本表';

-- =============================================
-- JSON 字段数据结构说明
-- =============================================

/*
dictation_words 表 JSON 字段结构：

1. sentences 字段结构：
[
  {
    "sentence": "This is a beautiful day.",
    "translation": "这是美好的一天。"
  }
]

2. synonyms 字段结构：
[
  {
    "word": "pretty",
    "translation": "漂亮的"
  }
]

3. translations 字段结构：
[
  {
    "translation": "美丽的",
    "part_of_speech": "adj",
    "is_primary": true,
    "source": "ai_recognition"
  }
]

4. phrases 字段结构：
[
  {
    "phrase": "beautiful day",
    "translation": "美好的一天"
  }
]

5. related_words 字段结构：
[
  {
    "word": "beauty",
    "translation": "美丽",
    "relation_type": "derivative"
  }
]

wrong_words 表 word_details JSON 字段结构：
{
  "us_phonetic": "/ˈbjutɪfəl/",
  "uk_phonetic": "/ˈbjuːtɪfəl/",
  "translations": [
    {
      "translation": "美丽的",
      "part_of_speech": "adj"
    }
  ],
  "sentences": [
    {
      "sentence": "She is beautiful.",
      "translation": "她很美丽。"
    }
  ],
  "synonyms": [
    {
      "word": "pretty",
      "translation": "漂亮的"
    }
  ],
  "phrases": [
    {
      "phrase": "beautiful day",
      "translation": "美好的一天"
    }
  ]
}
*/

-- =============================================
-- 索引优化建议
-- =============================================

-- 为了提高查询性能，建议根据实际业务需求添加复合索引：

-- 听写记录表复合索引
-- ALTER TABLE dictation_records ADD INDEX idx_user_status (user_id, status);
-- ALTER TABLE dictation_records ADD INDEX idx_user_created (user_id, created_at);

-- 听写单词表复合索引  
-- ALTER TABLE dictation_words ADD INDEX idx_record_status (dictation_record_id, status);
-- ALTER TABLE dictation_words ADD INDEX idx_record_order (dictation_record_id, sort_order);

-- 错题本表复合索引
-- ALTER TABLE wrong_words ADD INDEX idx_user_status (user_id, review_status);
-- ALTER TABLE wrong_words ADD INDEX idx_user_word (user_id, word);