-- =============================================
-- 图片识别模块数据库建表语句（早期版本）
-- Author: wanglx  
-- Date: 2025-10-09
-- Description: 简化的单词表实体（已被words模块替代）
-- 注意：此表已被新的words模块所替代，仅作为历史参考
-- =============================================

-- 图片识别模块简化单词表（已废弃）
CREATE TABLE `recognition_words` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `word` varchar(100) NOT NULL UNIQUE COMMENT '单词',
  `phonetic` varchar(200) DEFAULT NULL COMMENT '音标',
  `audio_url` varchar(500) DEFAULT NULL COMMENT '读音文件URL',
  `source` varchar(50) DEFAULT NULL COMMENT '词汇来源（如BEC_2）',
  `view_count` int NOT NULL DEFAULT '0' COMMENT '查看次数',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_recognition_words_word` (`word`),
  KEY `IDX_recognition_words_source` (`source`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='图片识别简化单词表（已废弃）';

-- =============================================
-- 说明
-- =============================================
/*
此表为早期图片识别模块使用的简化单词表，
现已被 words 模块中的完整表结构所替代。

新的表结构位于 create_words_tables.sql 中，
包含更完整的数据规范化设计。
*/