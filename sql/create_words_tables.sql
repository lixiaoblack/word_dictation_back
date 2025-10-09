-- =============================================
-- 单词管理系统数据库建表语句
-- Author: wanglx  
-- Date: 2025-10-09
-- Description: 包含单词主表、单词书、翻译、短语、例句、近义词、同根词等表
-- 注意：遵循数据库第三范式，将单词信息拆分为多个关联表避免重复存储
-- =============================================

-- 1. 单词书表
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

-- 2. 单词主表
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

-- 3. 单词翻译表
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

-- 4. 单词短语表
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

-- 5. 单词例句表
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

-- 6. 单词近义词表
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

-- 7. 单词同根词表
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
-- 数据表说明
-- =============================================
/*
表设计遵循数据库第三范式：
1. word_books: 单词书目录管理
2. words: 单词主表，通过book_id关联单词书
3. word_translations: 单词翻译表，支持一个单词多个翻译
4. word_phrases: 单词短语表，存储相关短语
5. word_sentences: 单词例句表，存储例句
6. word_synonyms: 单词近义词表
7. word_related_words: 单词同根词表

唯一性约束：
- 同一个单词可以在不同单词书中重复录入
- 采用 word + book_id 组合键保证唯一性
*/