-- =============================================
-- TTS音频记录表创建脚本
-- Author: wanglx  
-- Date: 2025-10-09
-- Description: TTS音频文件存储和管理表
-- =============================================

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