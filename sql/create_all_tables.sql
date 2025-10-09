-- =============================================
-- 英语学习系统完整数据库建表语句
-- Author: wanglx  
-- Date: 2025-10-09
-- Description: 包含所有模块的数据库表创建语句
-- =============================================

-- 设置字符集和时区
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- 1. 用户管理模块
-- =============================================

-- 用户主表
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(36) NOT NULL UNIQUE COMMENT '用户UUID',
  `username` varchar(50) DEFAULT NULL UNIQUE COMMENT '用户名',
  `password` varchar(255) DEFAULT NULL COMMENT '密码',
  `phone` varchar(20) DEFAULT NULL UNIQUE COMMENT '手机号',
  `email` varchar(255) DEFAULT NULL UNIQUE COMMENT '邮箱',
  `is_guest` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否游客用户',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_users_uuid` (`uuid`),
  UNIQUE KEY `IDX_users_username` (`username`),
  UNIQUE KEY `IDX_users_phone` (`phone`),
  UNIQUE KEY `IDX_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户主表';

-- 用户详情表
CREATE TABLE `user_detail` (
  `userId` bigint NOT NULL COMMENT '用户ID（关联users表）',
  `name` varchar(255) DEFAULT NULL COMMENT '真实姓名',
  `age` int DEFAULT NULL COMMENT '年龄',
  `sex` varchar(255) DEFAULT NULL COMMENT '性别',
  `icon` varchar(255) DEFAULT NULL COMMENT '头像URL',
  `grade` varchar(255) DEFAULT NULL COMMENT '年级',
  `class` varchar(255) DEFAULT NULL COMMENT '班级',
  `school` varchar(255) DEFAULT NULL COMMENT '学校',
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户详情表';

-- =============================================
-- 2. 单词管理模块
-- =============================================

-- 单词书表
CREATE TABLE `word_books` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `book_id` varchar(50) NOT NULL UNIQUE COMMENT '单词书ID（如BEC_2, CET4_3）',
  `book_name` varchar(200) NOT NULL COMMENT '单词书名称',
  `description` varchar(500) DEFAULT NULL COMMENT '单词书描述',
  `category` varchar(100) DEFAULT NULL COMMENT '单词书类别（如：考试、生活、商务）',
  `difficulty_level` varchar(50) DEFAULT NULL COMMENT '难度等级（如：初级、中级、高级）',
  `target_audience` varchar(100) DEFAULT NULL COMMENT '目标用户（如：中学生、大学生、职场人士）',
  `total_words` int NOT NULL DEFAULT '0' COMMENT '单词总数',
  `is_recommended` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否推荐',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_word_books_book_id` (`book_id`),
  KEY `IDX_word_books_category` (`category`),
  KEY `IDX_word_books_difficulty` (`difficulty_level`),
  KEY `IDX_word_books_recommended` (`is_recommended`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='单词书表';

-- 单词主表
CREATE TABLE `words` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `word_rank` int DEFAULT NULL COMMENT '单词排序号',
  `word` varchar(100) NOT NULL COMMENT '单词文本',
  `word_id` varchar(50) DEFAULT NULL COMMENT '单词ID',
  `us_phonetic` varchar(200) DEFAULT NULL COMMENT '美式音标',
  `uk_phonetic` varchar(200) DEFAULT NULL COMMENT '英式音标',
  `us_speech` varchar(500) DEFAULT NULL COMMENT '美式发音URL参数',
  `uk_speech` varchar(500) DEFAULT NULL COMMENT '英式发音URL参数',
  `audio_url` varchar(500) DEFAULT NULL COMMENT '音频文件URL',
  `book_id` varchar(50) DEFAULT NULL COMMENT '单词书ID',
  `source` varchar(100) DEFAULT NULL COMMENT '数据来源标识',
  `remember_method` text DEFAULT NULL COMMENT '记忆方法',
  `view_count` int NOT NULL DEFAULT '0' COMMENT '查看次数',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_words_word_book` (`word`, `book_id`),
  KEY `IDX_words_word` (`word`),
  KEY `IDX_words_book_id` (`book_id`),
  KEY `IDX_words_source` (`source`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='单词主表';

-- 单词翻译表
CREATE TABLE `word_translations` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `word_id` int NOT NULL COMMENT '关联的单词ID',
  `translation` text NOT NULL COMMENT '翻译内容',
  `part_of_speech` varchar(20) DEFAULT NULL COMMENT '词性（n, v, adj, adv等）',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序字段',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `IDX_word_translations_word_id` (`word_id`),
  KEY `IDX_word_translations_part_of_speech` (`part_of_speech`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='单词翻译表';

-- 单词短语表
CREATE TABLE `word_phrases` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `word_id` int NOT NULL COMMENT '关联的单词ID',
  `phrase` varchar(200) NOT NULL COMMENT '短语内容',
  `translation` text NOT NULL COMMENT '短语翻译',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序字段',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `IDX_word_phrases_word_id` (`word_id`),
  KEY `IDX_word_phrases_phrase` (`phrase`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='单词短语表';

-- 单词例句表
CREATE TABLE `word_sentences` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `word_id` int NOT NULL COMMENT '关联的单词ID',
  `sentence_en` text NOT NULL COMMENT '英文例句',
  `sentence_cn` text NOT NULL COMMENT '中文翻译',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序字段',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `IDX_word_sentences_word_id` (`word_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='单词例句表';

-- 单词近义词表
CREATE TABLE `word_synonyms` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `word_id` int NOT NULL COMMENT '关联的单词ID',
  `part_of_speech` varchar(20) DEFAULT NULL COMMENT '词性（n, v, adj, adv等）',
  `meaning` text NOT NULL COMMENT '对应的词义说明',
  `synonym_word` varchar(100) NOT NULL COMMENT '近义词',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序字段',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `IDX_word_synonyms_word_id` (`word_id`),
  KEY `IDX_word_synonyms_synonym_word` (`synonym_word`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='单词近义词表';

-- 单词同根词表
CREATE TABLE `word_related_words` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `word_id` int NOT NULL COMMENT '关联的单词ID',
  `part_of_speech` varchar(20) NOT NULL COMMENT '词性（n, v, adj, adv等）',
  `related_word` varchar(100) NOT NULL COMMENT '同根词',
  `meaning` text NOT NULL COMMENT '词义说明',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序字段',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `IDX_word_related_words_word_id` (`word_id`),
  KEY `IDX_word_related_words_related_word` (`related_word`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='单词同根词表';

-- =============================================
-- 3. 听写管理模块
-- =============================================

-- 听写记录表
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

-- 听写单词表
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

-- 错题本表
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
-- 4. TTS音频存储模块
-- =============================================

-- TTS音频记录表
CREATE TABLE `tts_audio_records` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `content_hash` varchar(64) NOT NULL UNIQUE COMMENT '内容哈希值，用于去重',
  `text` text NOT NULL COMMENT '原始文本内容',
  `voice` varchar(100) NOT NULL COMMENT '使用的语音',
  `type` enum('word','sentence','text','batch') NOT NULL DEFAULT 'text' COMMENT '音频类型',
  `status` enum('pending','generating','completed','failed') NOT NULL DEFAULT 'pending' COMMENT '生成状态',
  `rate` decimal(3,2) NOT NULL DEFAULT '1.00' COMMENT '语速',
  `pitch` int NOT NULL DEFAULT '0' COMMENT '音调',
  `volume` int NOT NULL DEFAULT '100' COMMENT '音量',
  `file_url` varchar(500) DEFAULT NULL COMMENT 'OSS文件URL',
  `file_path` varchar(200) DEFAULT NULL COMMENT 'OSS文件路径',
  `file_name` varchar(100) DEFAULT NULL COMMENT '文件名',
  `file_size` int NOT NULL DEFAULT '0' COMMENT '文件大小（字节）',
  `duration` decimal(6,2) DEFAULT NULL COMMENT '音频时长（秒）',
  `format` varchar(50) NOT NULL DEFAULT 'audio/mpeg' COMMENT '音频格式',
  `usage_count` int NOT NULL DEFAULT '0' COMMENT '使用次数',
  `created_by` varchar(36) DEFAULT NULL COMMENT '创建者用户ID',
  `error_message` varchar(255) DEFAULT NULL COMMENT '错误信息（生成失败时）',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `last_used_at` datetime DEFAULT NULL COMMENT '最后使用时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_tts_content_hash` (`content_hash`),
  KEY `IDX_tts_text_voice` (`text`(50),`voice`),
  KEY `IDX_tts_type` (`type`),
  KEY `IDX_tts_status` (`status`),
  KEY `IDX_tts_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='TTS音频记录表';

-- =============================================
-- 完成建表
-- =============================================

SET FOREIGN_KEY_CHECKS = 1;

-- 输出完成信息
SELECT '英语学习系统数据库表创建完成！' as message;
SELECT 
  '包含模块：用户管理、单词管理、听写管理、TTS音频存储' as modules,
  '总计表数：13个' as total_tables;