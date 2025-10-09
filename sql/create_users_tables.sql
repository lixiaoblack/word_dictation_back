-- =============================================
-- 用户管理系统数据库建表语句
-- Author: wanglx  
-- Date: 2025-10-09
-- Description: 包含用户表和用户详情表
-- =============================================

-- 1. 用户主表
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

-- 2. 用户详情表
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